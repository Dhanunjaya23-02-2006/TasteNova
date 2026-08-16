import React, { useState, useEffect, useContext } from 'react';
import { Star, Search, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const SuperadminFeatured = () => {
    const { user } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [chefs, setChefs] = useState([]);

    const fetchChefs = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/featured`, { headers: { Authorization: `Bearer ${user.token}` } });
            if(res.ok) setChefs(await res.json());
        } catch(e) { console.error(e); }
    };

    useEffect(() => { if(user) fetchChefs(); }, [user]);

    const handleTogglePin = async (id, isPinned) => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/featured/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if(res.ok) {
                toast.success(isPinned ? 'Chef unpinned from featured' : 'Chef pinned as featured');
                fetchChefs();
            } else toast.error('Failed to update chef');
        } catch(e) { toast.error('Error updating chef'); }
    };



    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Featured Chefs</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manually pin top-performing chefs to boost their visibility on the homepage.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => toast.success('Search and click Pin to feature a chef')}>
                        <Crown size={16} /> Feature a Chef
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Currently Featured</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{chefs.filter(c => c.isPinned).length}</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Featured List</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="sa-search" style={{ paddingLeft: '32px', width: '250px' }} placeholder="Search chef name..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Chef ID</th>
                                <th>Name</th>
                                <th>Account Status</th>
                                <th>Featured Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chefs.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
                                <tr key={c._id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{c._id.substring(c._id.length - 8).toUpperCase()}</td>
                                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {c.name}
                                        {c.isPinned && <Crown size={16} color="#f1c40f" />}
                                    </td>
                                    <td>
                                        <span className={`sa-badge ${c.status === 'Active' ? 'sa-badge-green' : 'sa-badge-red'}`}>{c.status}</span>
                                    </td>
                                    <td>
                                        {c.isPinned ? <span className="sa-badge sa-badge-blue">Pinned</span> : <span className="sa-badge" style={{ background: '#ecf0f1', color: '#7f8c8d' }}>Unpinned</span>}
                                    </td>
                                    <td>
                                        {c.isPinned ? (
                                            <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--error)' }} onClick={() => handleTogglePin(c._id, true)}>Unpin</button>
                                        ) : (
                                            <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleTogglePin(c._id, false)}>Pin as Featured</button>
                                        )}
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

export default SuperadminFeatured;
