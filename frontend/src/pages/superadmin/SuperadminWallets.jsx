import React, { useState, useEffect, useContext } from 'react';
import { Search, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminWallets = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [search, setSearch] = useState('');
    const [wallets, setWallets] = useState([]);

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/finance/wallets`, { headers: { Authorization: `Bearer ${user.token}` } });
                if(res.ok) setWallets(await res.json());
            } catch(e) { console.error(e); }
        };
        if(user) fetchWallets();
    }, [user, lastUpdated]);


    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Wallet Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Monitor customer wallet balances and transaction history.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="sa-search" style={{ paddingLeft: '32px', width: '250px' }} placeholder="Search user or TXN ID..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(39, 174, 96, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wallet size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Wallet Balances</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{wallets.reduce((sum, w) => sum + (w.walletBalance || 0), 0).toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Credits (Today)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>₹12,500</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowDownRight size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Debits (Today)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>₹8,900</div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Recent Transactions</h3>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Current Balance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wallets.filter(w => w.name?.toLowerCase().includes(search.toLowerCase()) || w.email?.toLowerCase().includes(search.toLowerCase())).map(w => (
                                <tr key={w._id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{w._id.substring(w._id.length - 8).toUpperCase()}</td>
                                    <td style={{ fontWeight: 600 }}>{w.name}</td>
                                    <td>{w.email}</td>
                                    <td style={{ fontWeight: 700, color: '#27ae60' }}>₹{w.walletBalance.toLocaleString('en-IN')}</td>
                                    <td>
                                        <span className="sa-badge sa-badge-green">Active</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperadminWallets;
