import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';
import { AdminSocketContext } from '../../context/AdminSocketContext';

const SubadminCustomers = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(AdminSocketContext) || {};
    const [customers, setCustomers] = useState([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/subadmin/customers?search=${search}`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) { const d = await res.json(); setCustomers(Array.isArray(d) ? d : d.customers || []); setTotal(Array.isArray(d) ? d.length : d.total || 0); }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchCustomers(); }, [search, lastUpdated]);

    const handleSuspend = async (id) => {
        const reason = prompt('Reason for suspension (e.g., Fraud, Coupon abuse, Repeated fake orders):');
        if (!reason) return;
        try {
            const res = await fetch(`${API_URL}/subadmin/customers/${id}/suspend`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ reason, duration: '7d' })
            });
            if (res.ok) { toast.success('Customer suspended'); fetchCustomers(); } else { toast.error('Failed'); }
        } catch (e) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Customers</h1>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="sa-search" style={{ paddingLeft: '32px' }} placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? <div className="sa-empty">Loading...</div> : customers.length === 0 ? <div className="sa-empty">No customers found.</div> : (
                <div className="sa-table-wrap">
                <table className="sa-table">
                    <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={c.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.email}</td>
                                <td>{c.phone}</td>
                                <td><span className={`sa-badge ${c.status === 'active' ? 'sa-badge-green' : c.status === 'suspended' ? 'sa-badge-red' : 'sa-badge-yellow'}`}>{c.status}</span></td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {c.status === 'active' && (
                                        <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleSuspend(c._id)}>Suspend</button>
                                    )}
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

export default SubadminCustomers;
