import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const SubadminBanners = () => {
    const { user } = useContext(AuthContext);
    const [banners, setBanners] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', startDate: '', endDate: '' });

    const fetchBanners = async () => {
        try {
            const res = await fetch(`${API_URL}/subadmin/banners`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setBanners(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/subadmin/banners`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) { toast.success('Banner created!'); setShowForm(false); setForm({ title: '', imageUrl: '', linkUrl: '', startDate: '', endDate: '' }); fetchBanners(); }
            else { const d = await res.json(); toast.error(d.message || 'Failed'); }
        } catch (e) { toast.error('Error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            const res = await fetch(`${API_URL}/subadmin/banners/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) { toast.success('Banner deleted'); fetchBanners(); }
        } catch (e) { toast.error('Error'); }
    };

    const toggleActive = async (id, isActive) => {
        try {
            await fetch(`${API_URL}/subadmin/banners/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ isActive: !isActive })
            });
            fetchBanners();
        } catch (e) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Banners</h1>
                <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create Banner'}
                </button>
            </div>

            {showForm && (
                <div className="sa-card" style={{ marginBottom: '24px', maxWidth: '500px' }}>
                    <form onSubmit={handleCreate}>
                        <div className="input-group" style={{ marginBottom: '12px' }}><label>Title</label><input className="form-control" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                        <div className="input-group" style={{ marginBottom: '12px' }}><label>Image URL</label><input className="form-control" required value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} /></div>
                        <div className="input-group" style={{ marginBottom: '12px' }}><label>Link URL (optional)</label><input className="form-control" value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} /></div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <div className="input-group" style={{ flex: 1 }}><label>Start Date</label><input type="date" className="form-control" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                            <div className="input-group" style={{ flex: 1 }}><label>End Date</label><input type="date" className="form-control" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Publish Banner</button>
                    </form>
                </div>
            )}

            {banners.length === 0 ? <div className="sa-empty">No banners yet.</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {banners.map(b => (
                        <div key={b._id} className="sa-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ height: '140px', background: '#f0f0f0' }}>
                                <img src={b.imageUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                            </div>
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>{b.title}</span>
                                    <span className={`sa-badge ${b.isActive ? 'sa-badge-green' : 'sa-badge-gray'}`}>{b.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Type: {b.type}</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem' }} onClick={() => toggleActive(b._id, b.isActive)}>{b.isActive ? 'Deactivate' : 'Activate'}</button>
                                    {b.type === 'City' && <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleDelete(b._id)}>Delete</button>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubadminBanners;
