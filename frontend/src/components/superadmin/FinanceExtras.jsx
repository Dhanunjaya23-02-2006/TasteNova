import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, RefreshCw, FileText, CheckCircle, Download, Check } from 'lucide-react';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

export const PayoutsTab = ({ user }) => {
    const [wallets, setWallets] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resW = await fetch(`${API_URL}/superadmin/finance/wallets`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (resW.ok) setWallets(await resW.json());

            const resP = await fetch(`${API_URL}/superadmin/finance/payouts`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (resP.ok) setPayouts(await resP.json());
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSettleEscrow = async (walletId) => {
        if (!window.confirm("Move escrow funds to available balance?")) return;
        setProcessingId(walletId);
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/wallets/${walletId}/settle`, { method: 'POST', headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) { toast.success('Escrow settled!'); fetchData(); }
            else toast.error('Error settling escrow');
        } catch (e) { toast.error('Network error'); }
        setProcessingId(null);
    };

    const handleRequestPayout = async (walletId) => {
        if (!window.confirm("Request payout on behalf of user?")) return;
        setProcessingId(walletId);
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/payout/request/${walletId}`, { method: 'POST', headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) { toast.success('Payout requested!'); fetchData(); }
            else toast.error('Error requesting payout');
        } catch (e) { toast.error('Network error'); }
        setProcessingId(null);
    };

    const handlePayoutStatus = async (payoutId, status) => {
        if (!window.confirm(`Mark payout as ${status}?`)) return;
        setProcessingId(payoutId);
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/payout/${payoutId}/status`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) { toast.success(`Payout ${status}!`); fetchData(); }
            else toast.error('Error updating status');
        } catch (e) { toast.error('Network error'); }
        setProcessingId(null);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Wallet /> Financial Ledger & Payouts
            </h2>

            <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '20px' }}>User Wallets</h3>
                {loading ? <p>Loading wallets...</p> : (
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '15px' }}>User</th>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Pending (Escrow)</th>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Available</th>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Locked</th>
                                <th style={{ textAlign: 'right', padding: '15px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wallets.map(w => (
                                <tr key={w._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>
                                        {w.user_id?.name || 'Unknown User'}
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.wallet_type}</div>
                                    </td>
                                    <td style={{ padding: '15px', color: 'var(--warning)' }}>₹{w.pending_balance?.toFixed(2)}</td>
                                    <td style={{ padding: '15px', color: 'var(--success)' }}>₹{w.available_balance?.toFixed(2)}</td>
                                    <td style={{ padding: '15px', color: 'var(--error)' }}>₹{w.locked_balance?.toFixed(2)}</td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            {w.pending_balance > 0 && (
                                                <button className="btn btn-secondary" onClick={() => handleSettleEscrow(w._id)} disabled={processingId === w._id} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Settle Escrow</button>
                                            )}
                                            {w.available_balance > 0 && (
                                                <button className="btn btn-primary" onClick={() => handleRequestPayout(w._id)} disabled={processingId === w._id} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Request Payout</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '20px' }}>Payout Requests</h3>
                {loading ? <p>Loading payouts...</p> : (
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Chef</th>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Amount</th>
                                <th style={{ textAlign: 'left', padding: '15px' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '15px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>{p.chef_id?.name || 'Unknown'}</td>
                                    <td style={{ padding: '15px', fontSize: '1.1rem' }}>₹{p.amount.toFixed(2)}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span className={`badge ${p.status === 'Paid' ? 'badge-success' : p.status === 'Failed' ? 'badge-error' : 'badge-warning'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        {p.status !== 'Paid' && p.status !== 'Failed' && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                {p.status === 'Requested' && <button className="btn btn-secondary" onClick={() => handlePayoutStatus(p._id, 'Approved')} disabled={processingId === p._id} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Approve</button>}
                                                {p.status === 'Approved' && <button className="btn btn-secondary" onClick={() => handlePayoutStatus(p._id, 'Processing')} disabled={processingId === p._id} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Process</button>}
                                                {p.status === 'Processing' && <button className="btn btn-primary" onClick={() => handlePayoutStatus(p._id, 'Paid')} disabled={processingId === p._id} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Mark Paid</button>}
                                                <button className="btn" style={{ background: 'var(--error)', color: 'white', padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', border: 'none' }} onClick={() => handlePayoutStatus(p._id, 'Failed')} disabled={processingId === p._id}>Fail</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>
    );
};

export const TaxesTab = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Tax Configuration</h2>
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <FileText size={48} style={{ color: 'var(--primary-color)', marginBottom: '20px' }} />
                <h3>GST & Tax Settings</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', marginBottom: '30px' }}>
                    Configure platform-wide and city-specific tax brackets.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', minWidth: '200px' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>Food GST</h4>
                        <p style={{ margin: 0, fontSize: '1.5rem', color: 'var(--success)' }}>5%</p>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', minWidth: '200px' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>Service GST</h4>
                        <p style={{ margin: 0, fontSize: '1.5rem', color: 'var(--success)' }}>18%</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
