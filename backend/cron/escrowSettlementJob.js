const cron = require('node-cron');
const Order = require('../models/Order');
const CronJobLog = require('../models/CronJobLog');
const walletService = require('../services/walletService');

// Schedule job to run at 2:00 AM every day
const startEscrowSettlementJob = () => {
    cron.schedule('0 2 * * *', async () => {
        const jobName = 'escrow_settlement_T_plus_2';
        const startTime = new Date();
        
        let processedCount = 0;
        let failedCount = 0;
        let jobLog;
        
        try {
            console.log(`[CRON] Starting ${jobName} at ${startTime}`);
            jobLog = await CronJobLog.create({
                job_name: jobName,
                start_time: startTime,
                status: 'running'
            });

            // Find orders delivered more than 2 days ago and escrow is pending
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            // Use a cursor to prevent loading all documents into memory
            const orderCursor = Order.find({
                status: 'Completed',
                escrow_status: 'pending',
                deliveredAt: { $lte: twoDaysAgo }
            }).cursor();

            let batch = [];
            const BATCH_SIZE = 100;

            const processBatch = async (ordersToProcess) => {
                const promises = ordersToProcess.map(async (order) => {
                    try {
                        const idempotencyKey = `cron_settle_order_${order._id}`;

                        // Settle Chef Escrow
                        if (order.chefPayout && order.chefPayout > 0) {
                            const Wallet = require('../models/Wallet');
                            const chefWallet = await Wallet.findOne({ user_id: order.chef });
                            if (chefWallet) {
                                await walletService.settleEscrow(chefWallet._id, order.chefPayout, `${idempotencyKey}_chef`, 'System_Cron');
                            }
                        }

                        // Settle Delivery Escrow
                        if (order.deliveryPartner && order.deliveryPartnerPayout > 0) {
                            const Wallet = require('../models/Wallet');
                            const deliveryWallet = await Wallet.findOne({ user_id: order.deliveryPartner });
                            if (deliveryWallet) {
                                await walletService.settleEscrow(deliveryWallet._id, order.deliveryPartnerPayout, `${idempotencyKey}_delivery`, 'System_Cron');
                            }
                        }

                        // Update order status
                        order.escrow_status = 'settled';
                        await order.save();

                        return { status: 'fulfilled', id: order._id };
                    } catch (err) {
                        return { status: 'rejected', reason: err.message, id: order._id };
                    }
                });

                const results = await Promise.allSettled(promises);
                results.forEach((result) => {
                    if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
                        processedCount++;
                    } else {
                        failedCount++;
                        console.error(`[CRON] Error processing order:`, result.reason || (result.value && result.value.reason));
                    }
                });
            };

            for await (const order of orderCursor) {
                batch.push(order);
                if (batch.length >= BATCH_SIZE) {
                    await processBatch(batch);
                    batch = [];
                }
            }

            if (batch.length > 0) {
                await processBatch(batch);
            }

            jobLog.end_time = new Date();
            jobLog.processed_count = processedCount;
            jobLog.failed_count = failedCount;
            jobLog.status = 'completed';
            await jobLog.save();

            console.log(`[CRON] Finished ${jobName}. Processed: ${processedCount}, Failed: ${failedCount}`);
        } catch (error) {
            console.error(`[CRON] Fatal error in ${jobName}:`, error);
            if (jobLog) {
                jobLog.end_time = new Date();
                jobLog.status = 'failed';
                jobLog.error_message = error.message;
                await jobLog.save();
            }
        }
    });
};

module.exports = startEscrowSettlementJob;
