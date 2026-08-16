import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const SubadminPromotions = () => {
    const { user } = useContext(AuthContext);
    const [promos, setPromos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ code: '', title: '', description: '', discountType: 'percentage', discountPercentage: 10, discountFlat: 0, maxDiscountAmount: 100, minOrderValue: 0, validUntil: '' });

    const fetchPromos = async () => {
        try {
            const res = await fetch(`${API_URL}/subadmin/promotions`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setPromos(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchPromos(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/subadmin/promotions`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) { toast.success('Promotion created!'); setShowForm(false); setForm({ code: '', title: '', description: '', discountType: 'percentage', discountPercentage: 10, discountFlat: 0, maxDiscountAmount: 100, minOrderValue: 0, validUntil: '' }); fetchPromos(); }
            else { const d = await res.json(); toast.error(d.message || 'Failed'); }
        } catch (e) { toast.error('Error creating promotion'); }
    };

    const toggleActive = async (id, isActive) => {
        try {
            await fetch(`${API_URL}/subadmin/promotions/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ isActive: !isActive })
            });
            fetchPromos();
        } catch (e) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Promotions</h1>
                <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create Promotion'}
                </button>
            </div>

            {showForm && (
                <div className="sa-card" style={{ marginBottom: '24px', maxWidth: '500px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>New City Promotion</h3>
                    <form onSubmit={handleCreate}>
                        <div className="input-group" style={{ marginBottom: '12px' }}>
                            <label>Promo Code</label>
                            <input className="form-control" required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. HYD20OFF" />
                        </div>
                        <div className="input-group" style={{ marginBottom: '12px' }}>
                            <label>Title</label>
                            <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Hyderabad Lunch Offer" />
                        </div>
                        <div className="input-group" style={{ marginBottom: '12px' }}>
                            <label>Description</label>
                            <input className="form-control" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Discount (%)</label>
                                <input type="number" className="form-control" value={form.discountPercentage} onChange={e => setForm({...form, discountPercentage: e.target.value})} />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Max Discount (₹)</label>
                                <input type="number" className="form-control" value={form.maxDiscountAmount} onChange={e => setForm({...form, maxDiscountAmount: e.target.value})} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Min Order (₹)</label>
                                <input type="number" className="form-control" value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})} />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Valid Until</label>
                                <input type="date" className="form-control" required value={form.validUntil} onChange={e => setForm({...form, validUntil: e.target.value})} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Publish Promotion</button>
                    </form>
                </div>
            )}

            {promos.length === 0 ? <div className="sa-empty">No promotions yet.</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {promos.map(p => (
                        <div key={p._id} className="sa-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.code}</span>
                                <span className={`sa-badge ${p.isActive ? 'sa-badge-green' : 'sa-badge-gray'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            {p.title && <div style={{ fontWeight: 500, marginBottom: '4px' }}>{p.title}</div>}
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{p.description}</div>
                            <div style={{ fontSize: '0.85rem' }}>
                                <span>{p.discountPercentage}% off (max ₹{p.maxDiscountAmount})</span>
                                <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>Expires: {new Date(p.validUntil).toLocaleDateString()}</span>
                            </div>
                            <button className="btn btn-outline" style={{ marginTop: '12px', padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => toggleActive(p._id, p.isActive)}>
                                {p.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubadminPromotions;
