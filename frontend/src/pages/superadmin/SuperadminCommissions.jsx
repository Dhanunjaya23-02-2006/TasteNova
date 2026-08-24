import React, { useState, useEffect, useContext } from 'react';
import { Search, Edit3, Settings, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminCommissions = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [search, setSearch] = useState('');
    const [chefs, setChefs] = useState([]);
    const [defaultRate, setDefaultRate] = useState(20);

    // Modal state
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', chef: null, rate: 20 });

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/commissions`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) {
                const data = await res.json();
                setDefaultRate(data.defaultRate);
                setChefs(data.chefs);
            }
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        if(user) fetchData();
    }, [user, lastUpdated]);

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Commission Rates</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage global platform commissions and chef-specific overrides.
                    </p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="sa-search" style={{ paddingLeft: '32px', width: '250px' }} placeholder="Search chefs..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Global Settings */}
            <div className="sa-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(39, 174, 96, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Settings size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Global Default Commission</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>This rate applies to all new and standard chefs.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{defaultRate.toFixed(1)}%</span>
                    <button 
                        className="btn btn-outline" 
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                        onClick={() => setModalConfig({ isOpen: true, type: 'global', chef: null, rate: defaultRate })}
                    >
                        Edit Default
                    </button>
                </div>
            </div>

            {/* Chef Overrides Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Chef-Specific Overrides</h3>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Chef Name</th>
                                <th>Tier</th>
                                <th>Base Rate</th>
                                <th>Custom Override</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chefs.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(chef => (
                                <tr key={chef._id}>
                                    <td style={{ fontWeight: 600 }}>{chef.name}</td>
                                    <td><span className={`sa-badge ${chef.isPinned ? 'sa-badge-green' : ''}`}>{chef.isPinned ? 'Premium' : 'Standard'}</span></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{defaultRate}%</td>
                                    <td style={{ fontWeight: chef.commissionRate ? 700 : 400, color: chef.commissionRate ? 'var(--primary)' : 'inherit' }}>
                                        {chef.commissionRate ? `${chef.commissionRate}%` : '-'}
                                    </td>
                                    <td><span className="sa-badge sa-badge-green">{chef.status}</span></td>
                                    <td>
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            onClick={() => setModalConfig({ isOpen: true, type: 'chef', chef, rate: chef.commissionRate || defaultRate })}
                                        >
                                            <Edit3 size={14} /> Adjust
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalConfig.isOpen && (
                <div className="modal-overlay">
                    <div className="sa-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} />
                        <h3 style={{ margin: '0 0 20px 0' }}>
                            {modalConfig.type === 'global' ? 'Global Default Commission' : `Commission Override: ${modalConfig.chef?.name}`}
                        </h3>
                        
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const url = modalConfig.type === 'global' 
                                    ? `${API_URL}/superadmin/finance/commissions/global`
                                    : `${API_URL}/superadmin/finance/commissions/chef/${modalConfig.chef._id}`;
                                
                                const res = await fetch(url, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                    body: JSON.stringify({ rate: Number(modalConfig.rate) })
                                });
                                
                                if(res.ok) {
                                    toast.success(modalConfig.type === 'global' 
                                        ? `Global default updated to ${modalConfig.rate}%` 
                                        : `Override updated to ${modalConfig.rate}% for ${modalConfig.chef.name}`
                                    );
                                    setModalConfig({ ...modalConfig, isOpen: false });
                                    fetchData();
                                } else {
                                    toast.error('Failed to update commission rate');
                                }
                            } catch(err) {
                                toast.error('An error occurred');
                            }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>New Rate (%)</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={modalConfig.rate} 
                                    onChange={e => setModalConfig({...modalConfig, rate: e.target.value})} 
                                    required 
                                    step="0.1"
                                />
                                {modalConfig.type === 'global' && (
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        This will immediately affect all standard chefs without custom overrides.
                                    </p>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperadminCommissions;
