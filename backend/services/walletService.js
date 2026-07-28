const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const WalletAuditLog = require('../models/WalletAuditLog');

class WalletService {
    async creditPending(userId, amount, orderId, entityType, walletType, triggeredBy) {
        if (amount <= 0) return null;
        
        let session;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (e) {
            // Fallback for local dev without replica sets
            session = null; 
        }

        try {
            let wallet = await Wallet.findOne({ user_id: userId }).session(session);
            if (!wallet) {
                wallet = await Wallet.create([{ user_id: userId, wallet_type: walletType }], { session });
                wallet = wallet[0];
            }

            const oldPending = wallet.pending_balance;
            wallet.pending_balance += amount;
            await wallet.save({ session });

            const idempotencyKey = `credit_pending_${orderId}_${userId}`;
            
            // Prevent double credit
            const existingTx = await WalletTransaction.findOne({ idempotency_key: idempotencyKey }).session(session);
            if (existingTx) {
                if (session) { await session.abortTransaction(); session.endSession(); }
                return existingTx;
            }

            const tx = await WalletTransaction.create([{
                wallet_id: wallet._id,
                order_id: orderId,
                type: 'credit',
                amount: amount,
                status: 'pending',
                idempotency_key: idempotencyKey
            }], { session });

            await WalletAuditLog.create([{
                wallet_id: wallet._id,
                action: `${entityType} Credit (Escrow)`,
                action_type: 'credit',
                entity_type: 'transaction',
                entity_id: tx[0]._id,
                old_available: wallet.available_balance,
                new_available: wallet.available_balance,
                old_pending: oldPending,
                new_pending: wallet.pending_balance,
                old_locked: wallet.locked_balance,
                new_locked: wallet.locked_balance,
                triggered_by: triggeredBy
            }], { session });

            if (session) { await session.commitTransaction(); session.endSession(); }
            return tx[0];
        } catch (error) {
            if (session) { await session.abortTransaction(); session.endSession(); }
            throw error;
        }
    }

    async settleEscrow(walletId, amount, idempotencyKey, triggeredBy) {
        let session;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (e) {
            session = null; 
        }

        try {
            let wallet = await Wallet.findById(walletId).session(session);
            if (!wallet) throw new Error('Wallet not found');

            const existingTx = await WalletTransaction.findOne({ idempotency_key: idempotencyKey }).session(session);
            if (existingTx) {
                if (session) { await session.abortTransaction(); session.endSession(); }
                return existingTx;
            }

            if (wallet.pending_balance < amount) throw new Error('Insufficient pending balance to settle');

            const oldAvailable = wallet.available_balance;
            const oldPending = wallet.pending_balance;

            wallet.available_balance += amount;
            wallet.pending_balance -= amount;
            await wallet.save({ session });

            const tx = await WalletTransaction.create([{
                wallet_id: wallet._id,
                type: 'adjustment', // internal transfer
                amount: amount,
                status: 'completed',
                idempotency_key: idempotencyKey
            }], { session });

            await WalletAuditLog.create([{
                wallet_id: wallet._id,
                action: 'Settle Escrow to Available',
                action_type: 'settle',
                entity_type: 'transaction',
                entity_id: tx[0]._id,
                old_available: oldAvailable,
                new_available: wallet.available_balance,
                old_pending: oldPending,
                new_pending: wallet.pending_balance,
                old_locked: wallet.locked_balance,
                new_locked: wallet.locked_balance,
                triggered_by: triggeredBy
            }], { session });

            if (session) { await session.commitTransaction(); session.endSession(); }
            return tx[0];
        } catch (error) {
            if (session) { await session.abortTransaction(); session.endSession(); }
            throw error;
        }
    }

    async lockForPayout(walletId, amount, payoutId, idempotencyKey, triggeredBy) {
        let session;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (e) {
            session = null;
        }

        try {
            let wallet = await Wallet.findById(walletId).session(session);
            if (!wallet) throw new Error('Wallet not found');

            const existingLog = await WalletAuditLog.findOne({ entity_id: payoutId, action_type: 'lock' }).session(session);
            if (existingLog) {
                if (session) { await session.abortTransaction(); session.endSession(); }
                return null; // Already locked
            }

            if (wallet.available_balance < amount) throw new Error('Insufficient available balance');

            const oldAvailable = wallet.available_balance;
            const oldLocked = wallet.locked_balance;

            wallet.available_balance -= amount;
            wallet.locked_balance += amount;
            await wallet.save({ session });

            await WalletAuditLog.create([{
                wallet_id: wallet._id,
                action: 'Payout Requested (Funds Locked)',
                action_type: 'lock',
                entity_type: 'payout',
                entity_id: payoutId,
                old_available: oldAvailable,
                new_available: wallet.available_balance,
                old_pending: wallet.pending_balance,
                new_pending: wallet.pending_balance,
                old_locked: oldLocked,
                new_locked: wallet.locked_balance,
                triggered_by: triggeredBy
            }], { session });

            if (session) { await session.commitTransaction(); session.endSession(); }
            return wallet;
        } catch (error) {
            if (session) { await session.abortTransaction(); session.endSession(); }
            throw error;
        }
    }

    async processPayoutDebit(walletId, amount, payoutId, idempotencyKey, triggeredBy) {
        let session;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (e) {
            session = null;
        }

        try {
            let wallet = await Wallet.findById(walletId).session(session);
            if (!wallet) throw new Error('Wallet not found');

            const existingTx = await WalletTransaction.findOne({ idempotency_key: idempotencyKey }).session(session);
            if (existingTx) {
                if (session) { await session.abortTransaction(); session.endSession(); }
                return existingTx;
            }

            if (wallet.locked_balance < amount) throw new Error('Insufficient locked balance');

            const oldLocked = wallet.locked_balance;
            wallet.locked_balance -= amount;
            await wallet.save({ session });

            const tx = await WalletTransaction.create([{
                wallet_id: wallet._id,
                type: 'debit',
                amount: amount,
                status: 'completed',
                idempotency_key: idempotencyKey
            }], { session });

            await WalletAuditLog.create([{
                wallet_id: wallet._id,
                action: 'Payout Paid (Funds Deducted)',
                action_type: 'debit',
                entity_type: 'payout',
                entity_id: payoutId,
                old_available: wallet.available_balance,
                new_available: wallet.available_balance,
                old_pending: wallet.pending_balance,
                new_pending: wallet.pending_balance,
                old_locked: oldLocked,
                new_locked: wallet.locked_balance,
                triggered_by: triggeredBy
            }], { session });

            if (session) { await session.commitTransaction(); session.endSession(); }
            return tx[0];
        } catch (error) {
            if (session) { await session.abortTransaction(); session.endSession(); }
            throw error;
        }
    }

    async unlockFailedPayout(walletId, amount, payoutId, idempotencyKey, triggeredBy) {
        let session;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (e) {
            session = null;
        }

        try {
            let wallet = await Wallet.findById(walletId).session(session);
            if (!wallet) throw new Error('Wallet not found');

            const existingLog = await WalletAuditLog.findOne({ entity_id: payoutId, action_type: 'unlock' }).session(session);
            if (existingLog) {
                if (session) { await session.abortTransaction(); session.endSession(); }
                return null;
            }

            if (wallet.locked_balance < amount) throw new Error('Insufficient locked balance to unlock');

            const oldAvailable = wallet.available_balance;
            const oldLocked = wallet.locked_balance;

            wallet.locked_balance -= amount;
            wallet.available_balance += amount;
            await wallet.save({ session });

            await WalletAuditLog.create([{
                wallet_id: wallet._id,
                action: 'Payout Failed/Cancelled (Funds Unlocked)',
                action_type: 'unlock',
                entity_type: 'payout',
                entity_id: payoutId,
                old_available: oldAvailable,
                new_available: wallet.available_balance,
                old_pending: wallet.pending_balance,
                new_pending: wallet.pending_balance,
                old_locked: oldLocked,
                new_locked: wallet.locked_balance,
                triggered_by: triggeredBy
            }], { session });

            if (session) { await session.commitTransaction(); session.endSession(); }
            return wallet;
        } catch (error) {
            if (session) { await session.abortTransaction(); session.endSession(); }
            throw error;
        }
    }
}

module.exports = new WalletService();
