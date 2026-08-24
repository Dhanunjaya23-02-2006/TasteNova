import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const SuperadminCities = () => {
    const { user } = useContext(AuthContext);
    const [cities, setCities] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', state: '', baseDeliveryFee: 40, perKmFee: 10, freeDeliveryThreshold: 500, refundThreshold: 500, zones: '' });

    const fetchCities = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/cities`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setCities(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchCities(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const body = { ...form, zones: form.zones.split(',').map(z => z.trim()).filter(z => z) };
            const res = await fetch(`${API_URL}/superadmin/cities`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(body)
            });
            if (res.ok) { toast.success('City created'); setShowForm(false); fetchCities(); }
            else { const d = await res.json(); toast.error(d.message); }
        } catch (e) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Cities & Zones</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage operational regions</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add City'}
                </button>
            </div>

            {showForm && (
                <div className="sa-modal-card">
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <div className="input-group" style={{ flex: 1 }}><label>City Name</label><input required className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                            <div className="input-group" style={{ flex: 1 }}><label>State</label><input required className="form-control" value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
                        </div>
                        <div className="input-group" style={{ marginBottom: '12px' }}>
                            <label>Zones (comma separated)</label>
                            <input className="form-control" value={form.zones} onChange={e => setForm({...form, zones: e.target.value})} placeholder="e.g. Gachibowli, Madhapur" />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <div className="input-group" style={{ flex: 1 }}><label>Base Delivery (₹)</label><input type="number" required className="form-control" value={form.baseDeliveryFee} onChange={e => setForm({...form, baseDeliveryFee: e.target.value})} /></div>
                            <div className="input-group" style={{ flex: 1 }}><label>Per Km Fee (₹)</label><input type="number" required className="form-control" value={form.perKmFee} onChange={e => setForm({...form, perKmFee: e.target.value})} /></div>
                            <div className="input-group" style={{ flex: 1 }}><label>Free Del. Min (₹)</label><input type="number" required className="form-control" value={form.freeDeliveryThreshold} onChange={e => setForm({...form, freeDeliveryThreshold: e.target.value})} /></div>
                        </div>
                        <div className="input-group" style={{ marginBottom: '16px' }}>
                            <label>Refund Threshold (₹) - Auto approve under this</label>
                            <input type="number" required className="form-control" value={form.refundThreshold} onChange={e => setForm({...form, refundThreshold: e.target.value})} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save City</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gap: '16px' }}>
                {cities.map(c => (
                    <div key={c._id} className="sa-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 className="sa-modal-title">{c.name}, {c.state}</h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sub-Admin: {c.subAdminId ? c.subAdminId.name : 'Unassigned'}</div>
                            </div>
                            <span className={`sa-badge ${c.isActive ? 'sa-badge-green' : 'sa-badge-gray'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        
                        <div style={{ marginTop: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                            <div><strong>Delivery Base:</strong> ₹{c.baseDeliveryFee}</div>
                            <div><strong>Per Km:</strong> ₹{c.perKmFee}</div>
                            <div><strong>Free Delivery Over:</strong> ₹{c.freeDeliveryThreshold}</div>
                            <div><strong>Refund Threshold:</strong> ₹{c.refundThreshold}</div>
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Zones:</strong>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {c.zones && c.zones.length > 0 ? c.zones.map((z, i) => (
                                    <span key={i} className="sa-badge sa-badge-gray">{z}</span>
                                )) : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No zones defined</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuperadminCities;
