import React, { useState, useEffect, useContext } from 'react';
import { Image, UploadCloud, Edit3, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const SuperadminBanners = () => {
    const { user } = useContext(AuthContext);
    const [banners, setBanners] = useState([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', imageUrl: '', linkUrl: '', type: 'Global', displayOrder: 0, isActive: true });

    const fetchBanners = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/banners`, { headers: { Authorization: `Bearer ${user.token}` } });
            if(res.ok) setBanners(await res.json());
        } catch(e) { console.error(e); }
    };

    useEffect(() => { if(user) fetchBanners(); }, [user]);

    const openModal = (banner = null) => {
        if(banner) {
            setEditingId(banner._id);
            setFormData({ title: banner.title, imageUrl: banner.imageUrl, linkUrl: banner.linkUrl || '', type: banner.type || 'Global', displayOrder: banner.displayOrder, isActive: banner.isActive });
        } else {
            setEditingId(null);
            setFormData({ title: '', imageUrl: '', linkUrl: '', type: 'Global', displayOrder: banners.length, isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${API_URL}/superadmin/marketing/banners/${editingId}` : `${API_URL}/superadmin/marketing/banners`;
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });
            if(res.ok) {
                toast.success(editingId ? 'Banner updated' : 'Banner created');
                setIsModalOpen(false);
                fetchBanners();
            } else toast.error('Error saving banner');
        } catch(e) { toast.error('Error saving banner'); }
    };

    const confirmDelete = (id) => {
        setBannerToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if(!bannerToDelete) return;
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/banners/${bannerToDelete}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
            if(res.ok) { toast.success('Banner deleted'); fetchBanners(); setIsDeleteModalOpen(false); setBannerToDelete(null); }
        } catch(e) { toast.error('Error deleting banner'); }
    };

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Hero Banners</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage the rotating banners on the customer app home screen.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }} onClick={() => openModal()}>
                        <UploadCloud size={16} /> Upload Banner
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Banners</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{banners.filter(b => b.isActive).length}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Banners</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{banners.length}</div>
                    </div>
                </div>
            </div>

            {/* Banners Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {banners.map(banner => (
                    <div key={banner._id} className="sa-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
                        <div style={{ height: '160px', width: '100%', position: 'relative', background: '#f0f0f0' }}>
                            <img src={banner.imageUrl} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                                <span style={{ background: banner.isActive ? '#27ae60' : '#e74c3c', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                                    {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                                {banner.type && (
                                    <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' }}>
                                        {banner.type}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>{banner.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Link: <span style={{ color: 'var(--primary)' }}>{banner.linkUrl || 'N/A'}</span></p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Position: {banner.displayOrder}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{ background: 'rgba(52, 152, 219, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => openModal(banner)}>
                                        <Edit3 size={16} />
                                    </button>
                                    <button style={{ background: 'rgba(231, 76, 60, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => confirmDelete(banner._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Empty Upload Card */}
                <div className="sa-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', border: '2px dashed var(--border-subtle)', background: 'transparent', cursor: 'pointer', padding: '24px' }} onClick={() => openModal()}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(23, 107, 69, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <UploadCloud size={28} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Add New Banner</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: '200px' }}>Recommended size: 1200×600px. Max size 2MB.</p>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="sa-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', position: 'relative' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsModalOpen(false)} />
                        <h3 style={{ margin: '0 0 24px 0', fontFamily: "'DM Serif Display', serif" }}>{editingId ? 'Edit Banner' : 'Upload Banner'}</h3>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Banner Title</label>
                                <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Image URL</label>
                                <input type="url" className="form-control" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required placeholder="https://..." />
                            </div>
                            {formData.imageUrl && (
                                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', height: '120px' }}>
                                    <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Link URL (Optional)</label>
                                <input type="text" className="form-control" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} placeholder="/promo/..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type</label>
                                    <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="Global">Global</option>
                                        <option value="City">City</option>
                                        <option value="Seasonal">Seasonal</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order</label>
                                    <input type="number" className="form-control" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: Number(e.target.value)})} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</label>
                                    <select className="form-control" value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                                {editingId ? 'Save Changes' : 'Upload Banner'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsDeleteModalOpen(false); }}>
                    <div className="sa-card" style={{ width: '100%', maxWidth: '380px', padding: '28px', position: 'relative', textAlign: 'center' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsDeleteModalOpen(false)} />
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F8D7DA', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                            <Trash2 size={22} />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: 'var(--error)' }}>Delete Banner</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Are you sure you want to delete this banner?</p>
                        
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ background: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperadminBanners;
