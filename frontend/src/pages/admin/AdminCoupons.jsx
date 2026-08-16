import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const AdminCoupons = () => {
    const { user } = useContext(AuthContext);
    const [coupons, setCoupons] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ code: '', description: '', discountType: 'flat', discountFlat: 50, discountPercentage: 0, maxDiscountAmount: 50, minOrderValue: 199, validUntil: '', usageLimit: 100, perUserLimit: 1 });

    const fetchCoupons = async () => {
        try {
            const res = await fetch(`${API_URL}/Admin/coupons`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setCoupons(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/Admin/coupons`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) { toast.success('Coupon created!'); setShowForm(false); fetchCoupons(); }
            else { const d = await res.json(); toast.error(d.message || 'Failed'); }
        } catch (e) { toast.error('Error'); }
    };

    const toggleActive = async (id, isActive) => {
        try {
            await fetch(`${API_URL}/Admin/coupons/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ isActive: !isActive })
            });
            fetchCoupons();
        } catch (e) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Coupons</h1>
                <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create Coupon'}
                </button>
            </div>

            {showForm && (
                <div className="sa-card" style={{ marginBottom: '24px', maxWidth: '500px' }}>
                    <form onSubmit={handleCreate}>
                        <div className="input-group" style={{ marginBottom: '12px' }}><label>Coupon Code</label><input className="form-control" required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. HYD50" /></div>
                        <div className="input-group" style={{ marginBottom: '12px' }}><label>Description</label><input className="form-control" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="₹50 off on orders above ₹199" /></div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <div className="input-group" style={{ flex: 1 }}><label>Flat Discount (₹)</label><input type="number" className="form-control" value={form.discountFlat} onChange={e => setForm({...form, discountFlat: e.target.value})} /></div>
                            <div className="input-group" style={{ flex: 1 }}><label>Min Order (₹)</label><input type="number" className="form-control" value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <div className="input-group" style={{ flex: 1 }}><label>Usage Limit</label><input type="number" className="form-control" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} /></div>
                            <div className="input-group" style={{ flex: 1 }}><label>Valid Until</label><input type="date" className="form-control" required value={form.validUntil} onChange={e => setForm({...form, validUntil: e.target.value})} /></div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Coupon</button>
                    </form>
                </div>
            )}

            {coupons.length === 0 ? <div className="sa-empty">No coupons yet.</div> : (
                <div className="sa-table-wrap">
                <table className="sa-table">
                    <thead><tr><th>Code</th><th>Description</th><th>Discount</th><th>Min Order</th><th>Usage</th><th>Status</th><th>Expires</th><th>Actions</th></tr></thead>
                    <tbody>
                        {coupons.map(c => (
                            <tr key={c._id}>
                                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{c.code}</td>
                                <td style={{ fontSize: '0.85rem' }}>{c.description}</td>
                                <td>{c.discountType === 'flat' ? `₹${c.discountFlat}` : `${c.discountPercentage}%`}</td>
                                <td>₹{c.minOrderValue}</td>
                                <td>{c.usageCount || 0}/{c.usageLimit || '∞'}</td>
                                <td><span className={`sa-badge ${c.isActive ? 'sa-badge-green' : 'sa-badge-gray'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td style={{ fontSize: '0.85rem' }}>{new Date(c.validUntil).toLocaleDateString()}</td>
                                <td><button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem' }} onClick={() => toggleActive(c._id, c.isActive)}>{c.isActive ? 'Deactivate' : 'Activate'}</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
