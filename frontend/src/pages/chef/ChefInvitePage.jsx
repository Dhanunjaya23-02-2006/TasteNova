import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Copy, Users, Wallet, Gift, TrendingUp, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ChefInvitePage = () => {
    const { user } = useContext(AuthContext);
    const [walletInfo, setWalletInfo] = useState({
        earningsBalance: 0,
        referralCredits: 0,
        promotionalCredits: 0,
        totalBalance: 0,
        pendingBalance: 0
    });
    const [copied, setCopied] = useState(false);

    const [referralStats, setReferralStats] = useState({
        totalInvited: 0,
        successful: 0,
        pending: 0,
        totalEarned: 0,
        referralCode: ''
    });

    const referralLink = referralStats.referralCode ? `${window.location.origin}/chef/register?ref=${referralStats.referralCode}` : '';

    useEffect(() => {
        if (user) {
            fetchWallet();
            fetchReferralStats();
        }
    }, [user]);

    const fetchReferralStats = async () => {
        try {
            const res = await fetch(`${API_URL}/referrals/stats`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setReferralStats(await res.json());
            }
        } catch (error) { console.error('Error fetching referral stats', error); }
    };

    const fetchWallet = async () => {
        try {
            const res = await fetch(`${API_URL}/earnings/wallet`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setWalletInfo(await res.json());
            } else {
                // If endpoint doesn't exist yet, we just show 0s
            }
        } catch (error) { console.error('Error fetching wallet', error); }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success('Referral link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const cardStyle = {
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        padding: '24px'
    };

    return (
        <div style={{ maxWidth: '1000px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Invite & Earn</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Invite other Home Chefs to TasteNova and earn ₹250 for every successful activation.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Referral Link Card */}
                <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #EAF5F0 0%, #D4EAE0 100%)', border: 'none', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
                        <Gift size={150} color="#0F3F26" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 16px 0' }}>Your Referral Link</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '24px', maxWidth: '80%' }}>
                            Share this link with friends. You'll get ₹250 when they complete their first order!
                        </p>
                        
                        <div style={{ display: 'flex', gap: '8px', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <input 
                                type="text" 
                                value={referralLink} 
                                readOnly 
                                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', color: 'var(--text-muted)' }}
                            />
                            <button 
                                onClick={copyToClipboard}
                                className="btn btn-primary" 
                                style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Referral Stats */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} color="var(--primary)" /> Referral Status
                    </h2>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Invited</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26' }}>{referralStats.totalInvited}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Pending Approval</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e67e22' }}>{referralStats.pending}</div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Successful Activations</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#27ae60' }}>{referralStats.successful}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Earned</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26' }}>₹{referralStats.totalEarned}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Integration Section */}
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 16px 0' }}>Wallet Balance</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ ...cardStyle, background: '#0F3F26', color: '#fff', border: 'none' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Wallet size={16} /> Total Balance
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>₹{walletInfo.totalBalance || 0}</div>
                </div>
                
                <div style={cardStyle}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Gift size={16} color="var(--primary)" /> Referral Rewards
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F3F26' }}>+ ₹{walletInfo.referralCredits || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Available for payout</div>
                </div>

                <div style={cardStyle}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={16} color="var(--primary)" /> Order Earnings
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F3F26' }}>+ ₹{walletInfo.earningsBalance || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Withdrawable balance</div>
                </div>
            </div>

            <div style={{ marginTop: '40px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: '#F8F9FA' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#0F3F26' }}>How it works</h3>
                </div>
                <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', textAlign: 'center' }}>
                    <div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EAF5F0', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, margin: '0 auto 16px' }}>1</div>
                        <h4 style={{ fontSize: '0.9rem', color: '#0F3F26', margin: '0 0 8px 0' }}>Share your link</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Send your unique referral link to other home chefs in your network.</p>
                    </div>
                    <div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EAF5F0', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, margin: '0 auto 16px' }}>2</div>
                        <h4 style={{ fontSize: '0.9rem', color: '#0F3F26', margin: '0 0 8px 0' }}>They register</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>The chef creates an account and gets verified by our team.</p>
                    </div>
                    <div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EAF5F0', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, margin: '0 auto 16px' }}>3</div>
                        <h4 style={{ fontSize: '0.9rem', color: '#0F3F26', margin: '0 0 8px 0' }}>You get paid</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Once they complete their first order, ₹250 is added to your wallet.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChefInvitePage;
