import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { SocketContext } from '../../context/SocketContext';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, IndianRupee, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const WalletTab = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(500);
    const [isProcessing, setIsProcessing] = useState(false);

    const getAuthToken = () => user?.token || user?.accessToken || '';

    const fetchWallet = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/earnings/wallet`, { 
                headers: { Authorization: `Bearer ${getAuthToken()}` } 
            });
            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance || 0);
                const txnList = data.transactions || [];
                setTransactions(txnList.map(txn => ({
                    id: txn._id,
                    type: txn.type,
                    amount: txn.amount,
                    desc: txn.desc || txn.description || 'Transaction',
                    date: txn.createdAt,
                    icon: txn.type === 'credit' ? ArrowDownLeft : ArrowUpRight,
                    color: txn.type === 'credit' ? '#2ed573' : '#ff4757'
                })));
            } else {
                toast.error('Failed to load wallet data');
            }
        } catch (error) {
            console.error("Error fetching wallet", error);
            toast.error('Error fetching wallet');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchWallet();
    }, [user, fetchWallet]);

    useEffect(() => {
        if (!socket) return;
        
        const handleWalletUpdate = (data) => {
            setBalance(data.balance);
            if (data.transaction) {
                const txn = data.transaction;
                setTransactions(prev => [
                    {
                        id: txn._id,
                        type: txn.type,
                        amount: txn.amount,
                        desc: txn.desc || txn.description || (txn.type === 'credit' ? 'Wallet Credit' : 'Wallet Debit'),
                        date: txn.createdAt,
                        icon: txn.type === 'credit' ? ArrowDownLeft : ArrowUpRight,
                        color: txn.type === 'credit' ? '#2ed573' : '#ff4757'
                    },
                    ...prev
                ]);
            }
            toast.success(`Wallet updated. New balance: ₹${data.balance}`);
        };

        socket.on('wallet_update', handleWalletUpdate);
        
        return () => {
            socket.off('wallet_update', handleWalletUpdate);
        };
    }, [socket]);

    // Load Razorpay script dynamically
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById('razorpay-script')) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleTopUp = async () => {
        if (!topUpAmount || topUpAmount < 1) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsProcessing(true);

        try {
            // Step 1: Load Razorpay checkout script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error('Failed to load payment gateway. Check your internet connection.');
                setIsProcessing(false);
                return;
            }

            // Step 2: Create Razorpay order on backend
            const orderRes = await fetch(`${API_URL}/earnings/wallet/topup/create-order`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}` 
                },
                body: JSON.stringify({ amount: Number(topUpAmount) })
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json();
                toast.error(errData.message || 'Failed to create payment order');
                setIsProcessing(false);
                return;
            }

            const orderData = await orderRes.json();

            // Step 3: Open Razorpay checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'TasteNova',
                description: `Wallet Top-Up ₹${topUpAmount}`,
                order_id: orderData.orderId,
                handler: async (response) => {
                    // Step 4: Verify payment on backend
                    try {
                        const verifyRes = await fetch(`${API_URL}/earnings/wallet/topup/verify`, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${getAuthToken()}` 
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                amount: Number(topUpAmount)
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            setBalance(verifyData.balance || 0);
                            
                            // Add the new transaction to the list
                            const txn = verifyData.transaction;
                            if (txn) {
                                setTransactions(prev => [
                                    {
                                        id: txn._id,
                                        type: 'credit',
                                        amount: txn.amount,
                                        desc: txn.desc || 'Wallet Top-Up via Razorpay',
                                        date: txn.createdAt,
                                        icon: ArrowDownLeft,
                                        color: '#2ed573'
                                    },
                                    ...prev
                                ]);
                            }

                            setShowTopUp(false);
                            toast.success(`₹${topUpAmount} added to your TasteNova Cash!`);
                        } else {
                            toast.error(verifyData.message || 'Payment verification failed');
                            // Refetch wallet to get actual state
                            fetchWallet();
                        }
                    } catch (verifyError) {
                        console.error('Verification error:', verifyError);
                        toast.error('Payment verification failed. Contact support if amount was deducted.');
                        fetchWallet();
                    }
                    setIsProcessing(false);
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                theme: {
                    color: '#176B45'
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        toast('Payment cancelled', { icon: '❌' });
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', (response) => {
                setIsProcessing(false);
                toast.error(`Payment failed: ${response.error.description}`);
            });
            razorpay.open();

        } catch (error) {
            console.error('Top-up error', error);
            toast.error('An error occurred during top-up');
            setIsProcessing(false);
        }
    };

    if (loading) {
        return <div className="animate-fade-up" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading wallet...</div>;
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>TasteNova Cash</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your wallet balance and view transaction history.</p>
                </div>
                <button 
                    onClick={fetchWallet} 
                    className="btn btn-outline" 
                    style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Wallet Balance Card */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '20px', padding: '32px', color: '#fff', boxShadow: '0 10px 25px rgba(252, 128, 25, 0.3)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'scale(2)' }}>
                    <Wallet size={120} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div>
                        <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '4px' }}>Available Balance</p>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1px' }}>₹{Number(balance).toFixed(2)}</h1>
                    </div>
                    
                    <button onClick={() => setShowTopUp(true)} className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                        <Plus size={20} /> Add Money
                    </button>
                </div>
            </div>

            {/* Top-up Modal */}
            {showTopUp && (
                <div className="animate-fade-up" style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '16px' }}>Top-Up Wallet</h3>
                    
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                        {[100, 500, 1000, 2000].map(amount => (
                            <button 
                                key={amount}
                                onClick={() => setTopUpAmount(amount)}
                                style={{ flex: 1, padding: '12px', background: topUpAmount === amount ? 'rgba(252, 128, 25, 0.1)' : 'var(--bg-surface)', border: `2px solid ${topUpAmount === amount ? 'var(--primary)' : 'var(--border-subtle)'}`, color: topUpAmount === amount ? 'var(--primary)' : 'var(--text-main)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                +₹{amount}
                            </button>
                        ))}
                    </div>
                    
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-main)', fontWeight: 600, fontSize: '1.2rem' }}>₹</span>
                        <input 
                            type="number" 
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            min="1"
                            style={{ width: '100%', padding: '16px 16px 16px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 600, outline: 'none' }}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowTopUp(false)} className="btn btn-outline" style={{ flex: 1, padding: '14px', borderRadius: '12px' }}>Cancel</button>
                        <button onClick={handleTopUp} disabled={isProcessing || topUpAmount < 1} className="btn btn-primary" style={{ flex: 2, padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            {isProcessing ? (
                                <>
                                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...
                                </>
                            ) : (
                                <>
                                    <IndianRupee size={16} /> Pay ₹{topUpAmount}
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={14} /> Secured by Razorpay Payment Gateway
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>Recent Transactions</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {transactions.length > 0 ? (
                        transactions.map((txn, idx) => (
                            <div key={txn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: idx !== transactions.length - 1 ? '1px solid var(--border-subtle)' : 'none', background: 'var(--bg-surface)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-surface)'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${txn.color}15`, color: txn.color, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <txn.icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '4px' }}>{txn.desc}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(txn.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: txn.type === 'credit' ? '#2ed573' : 'var(--text-main)' }}>
                                    {txn.type === 'credit' ? '+' : '-'}₹{Number(txn.amount).toFixed(2)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No transactions yet.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default WalletTab;
