import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';
import { AdminSocketContext } from '../../context/AdminSocketContext';

const statusTabs = ['All', 'pending', 'active', 'suspended'];

const SubadminChefs = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(AdminSocketContext) || {};
    const [chefs, setChefs] = useState([]);
    const [total, setTotal] = useState(0);
    const [activeStatus, setActiveStatus] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchChefs = async () => {
        setLoading(true);
        try {
            let q = `?search=${search}`;
            if (activeStatus !== 'All') q += `&status=${activeStatus}`;
            const res = await fetch(`${API_URL}/subadmin/chefs${q}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChefs(Array.isArray(data) ? data : data.chefs || []);
                setTotal(Array.isArray(data) ? data.length : data.total || 0);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchChefs(); }, [activeStatus, search, lastUpdated]);

    const handleStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/subadmin/chefs/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) { toast.success(`Chef ${newStatus}`); fetchChefs(); }
            else { const d = await res.json(); toast.error(d.message); }
        } catch (e) { toast.error('Error updating chef'); }
    };

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Chefs</h1>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="sa-search" style={{ paddingLeft: '32px' }} placeholder="Search chefs..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="sa-tabs">
                {statusTabs.map(s => (
                    <button key={s} className={`sa-tab ${activeStatus === s ? 'active' : ''}`} onClick={() => setActiveStatus(s)}>
                        {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div className="sa-empty">Loading...</div> : chefs.length === 0 ? (
                <div className="sa-empty">No chefs found.</div>
            ) : (
                <div className="sa-table-wrap">
                <table className="sa-table">
                    <thead>
                        <tr><th>Kitchen</th><th>Name</th><th>Email</th><th>Rating</th><th>Verified</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {chefs.map(c => (
                            <tr key={c._id}>
                                <td style={{ fontWeight: 600 }}>{c.kitchenName || c.businessName || '—'}</td>
                                <td>{c.name}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.email}</td>
                                <td>{c.rating?.toFixed(1) || '—'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {c.isIdVerified && <span className="sa-badge sa-badge-green">ID</span>}
                                        {c.isFssaiVerified && <span className="sa-badge sa-badge-green">FSSAI</span>}
                                        {c.isKitchenVerified && <span className="sa-badge sa-badge-green">Kitchen</span>}
                                        {!c.isIdVerified && !c.isFssaiVerified && !c.isKitchenVerified && <span className="sa-badge sa-badge-gray">None</span>}
                                    </div>
                                </td>
                                <td>
                                    <span className={`sa-badge ${c.status === 'active' ? 'sa-badge-green' : c.status === 'suspended' ? 'sa-badge-red' : 'sa-badge-yellow'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {c.status === 'pending' && (
                                            <>
                                                <button className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '0.78rem' }} onClick={() => handleStatus(c._id, 'active')}>Approve</button>
                                                <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleStatus(c._id, 'suspended')}>Reject</button>
                                            </>
                                        )}
                                        {c.status === 'active' && (
                                            <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleStatus(c._id, 'suspended')}>Suspend</button>
                                        )}
                                        {c.status === 'suspended' && (
                                            <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem' }} onClick={() => handleStatus(c._id, 'active')}>Reactivate</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total: {total}</div>
        </div>
    );
};

export default SubadminChefs;
