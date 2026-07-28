import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Trash2, Edit3, Image as ImageIcon } from 'lucide-react';

const BannersTab = ({ user }) => {
    const [banners, setBanners] = useState([]);
    const [cities, setCities] = useState([]);
    const [chefs, setChefs] = useState([]);
    const [formData, setFormData] = useState({ 
        title: '', 
        imageUrl: '', 
        linkUrl: '', 
        type: 'Global', 
        targetCity: '', 
        targetChef: '', 
        startDate: '', 
        endDate: '', 
        displayOrder: 0 
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const resCities = await fetch(`${API_URL}/cities`);
            if (resCities.ok) setCities(await resCities.json());

            const resManagement = await fetch(`${API_URL}/users/all-management`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (resManagement.ok) {
                const data = await resManagement.json();
                setChefs(data.chefs || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBanners = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/banners`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setBanners(await res.json());
            }
        } catch (error) {
            console.error('Error fetching banners', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBanner = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/banners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success('Banner added successfully');
                setFormData({ title: '', imageUrl: '', linkUrl: '', type: 'Global', targetCity: '', targetChef: '', startDate: '', endDate: '', displayOrder: 0 });
                fetchBanners();
            } else {
                toast.error('Failed to add banner');
            }
        } catch (error) {
            toast.error('Error adding banner');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/banners/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                toast.success('Banner deleted');
                fetchBanners();
            }
        } catch (error) {
            toast.error('Error deleting banner');
        }
    };

    const toggleStatus = async (banner) => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/banners/${banner._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ isActive: !banner.isActive })
            });
            if (res.ok) {
                toast.success('Status updated');
                fetchBanners();
            }
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Global Promos (Banners)</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                {/* Form Section */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Add New Banner</h3>
                    <form onSubmit={handleCreateBanner} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="input-group">
                            <label>Banner Type</label>
                            <select 
                                className="form-control" 
                                value={formData.type} 
                                onChange={e => setFormData({...formData, type: e.target.value, targetCity: '', targetChef: ''})}
                            >
                                <option value="Global">Global (All Users)</option>
                                <option value="City">City Specific</option>
                                <option value="Chef">Chef Spotlight</option>
                                <option value="Festival">Festival / Timed</option>
                            </select>
                        </div>

                        {formData.type === 'City' && (
                            <div className="input-group">
                                <label>Target City</label>
                                <select 
                                    className="form-control" 
                                    value={formData.targetCity} 
                                    onChange={e => setFormData({...formData, targetCity: e.target.value})} 
                                    required
                                >
                                    <option value="">-- Choose City --</option>
                                    {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}

                        {formData.type === 'Chef' && (
                            <div className="input-group">
                                <label>Target Chef</label>
                                <select 
                                    className="form-control" 
                                    value={formData.targetChef} 
                                    onChange={e => setFormData({...formData, targetChef: e.target.value})} 
                                    required
                                >
                                    <option value="">-- Choose Chef --</option>
                                    {chefs.map(c => <option key={c._id} value={c._id}>{c.kitchenName || c.name}</option>)}
                                </select>
                            </div>
                        )}

                        {formData.type === 'Festival' && (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="input-group flex-1">
                                    <label>Start Date</label>
                                    <input type="date" className="form-control" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                                </div>
                                <div className="input-group flex-1">
                                    <label>End Date</label>
                                    <input type="date" className="form-control" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label>Banner Title</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. Summer Special 50% Off" 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="input-group">
                            <label>Image URL</label>
                            <input 
                                type="url" 
                                className="form-control" 
                                placeholder="https://..." 
                                value={formData.imageUrl} 
                                onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                                required 
                            />
                            <small style={{ color: 'var(--text-muted)' }}>Use a 16:9 ratio image for best results.</small>
                        </div>
                        <div className="input-group">
                            <label>Link URL (Optional)</label>
                            <input 
                                type="url" 
                                className="form-control" 
                                placeholder="/offers/summer" 
                                value={formData.linkUrl} 
                                onChange={e => setFormData({...formData, linkUrl: e.target.value})} 
                            />
                        </div>
                        <div className="input-group">
                            <label>Display Order</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={formData.displayOrder} 
                                onChange={e => setFormData({...formData, displayOrder: e.target.value})} 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Create Banner</button>
                    </form>
                </div>

                {/* List Section */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Active Banners</h3>
                    {banners.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No banners found. Create one to display on the app home screen.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {banners.map(banner => (
                                <div key={banner._id} style={{ display: 'flex', gap: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '150px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {banner.imageUrl ? (
                                            <img src={banner.imageUrl} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ImageIcon size={32} color="#666" />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0' }}>
                                            {banner.title} 
                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--primary)', color: '#000', borderRadius: '4px', marginLeft: '10px' }}>{banner.type}</span>
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order: {banner.displayOrder}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => toggleStatus(banner)}
                                            className={`btn btn-${banner.isActive ? 'primary' : 'secondary'}`} 
                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                        >
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                        <button onClick={() => handleDelete(banner._id)} className="btn btn-secondary" style={{ padding: '8px', color: 'var(--error)' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default BannersTab;
