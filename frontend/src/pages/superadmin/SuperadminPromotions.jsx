import React, { useState, useEffect, useContext } from 'react';
import { Tag, Search, PlusCircle, CheckCircle, Clock, X, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminPromotions = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [search, setSearch] = useState('');
    const [promotions, setPromotions] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '', code: '', description: '', discountType: 'percentage', discountPercentage: 10, discountFlat: 0,
        maxDiscountAmount: 100, minOrderValue: 200, scope: 'Global', validUntil: ''
    });

    const fetchPromotions = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/offers`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) {
                const data = await res.json();
                setPromotions(data.filter(o => o.type === 'promotion'));
            }
        } catch(e) { console.error(e); }
    };

    useEffect(() => { if(user) fetchPromotions(); }, [user, lastUpdated]);

    const openModal = (promo = null) => {
        if(promo) {
            setEditingId(promo._id);
            setFormData({
                title: promo.title || '', code: promo.code, description: promo.description, discountType: promo.discountType,
                discountPercentage: promo.discountPercentage || 0, discountFlat: promo.discountFlat || 0,
                maxDiscountAmount: promo.maxDiscountAmount, minOrderValue: promo.minOrderValue,
                scope: promo.scope, validUntil: new Date(promo.validUntil).toISOString().split('T')[0]
            });
        } else {
            setEditingId(null);
            setFormData({ title: '', code: '', description: '', discountType: 'percentage', discountPercentage: 10, discountFlat: 0, maxDiscountAmount: 100, minOrderValue: 200, scope: 'Global', validUntil: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${API_URL}/superadmin/marketing/offers/${editingId}` : `${API_URL}/superadmin/marketing/offers`;
            
            const payload = { ...formData, type: 'promotion' };
            if (payload.discountType === 'percentage') payload.discountFlat = 0;
            else payload.discountPercentage = 0;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingId ? 'Promotion updated' : 'Promotion created');
                setIsModalOpen(false);
                fetchPromotions();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Error saving promotion');
            }
        } catch (e) { toast.error('An error occurred'); }
    };

    const toggleStatus = async (promo) => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/offers/${promo._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ isActive: !promo.isActive })
            });
            if (res.ok) {
                toast.success(`Promotion ${promo.isActive ? 'deactivated' : 'activated'}`);
                fetchPromotions();
            }
        } catch (e) { toast.error('Error toggling status'); }
    };

    const confirmDelete = (id) => {
        setPromoToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!promoToDelete) return;
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/offers/${promoToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                toast.success('Promotion deleted');
                fetchPromotions();
                setIsDeleteModalOpen(false);
                setPromoToDelete(null);
            } else toast.error('Error deleting promotion');
        } catch (e) { toast.error('Error deleting promotion'); }
    };


    return (
        <>
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Platform Promotions</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Create and manage global or city-level promotional rules and discounts.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => openModal()}>
                        <PlusCircle size={16} /> Create Promotion
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Promos</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{promotions.filter(p => p.isActive).length}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Promos</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{promotions.length}</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 className="sa-modal-title">All Promotions</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="sa-search" style={{ paddingLeft: '32px', width: '250px' }} placeholder="Search promotions..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Promo ID</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Scope</th>
                                <th>Validity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.filter(p => (p.title || '').toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No promotions found</td></tr>
                            ) : (
                                promotions.filter(p => (p.title || '').toLowerCase().includes(search.toLowerCase())).map(p => (
                                    <tr key={p._id}>
                                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p._id.substring(p._id.length - 8).toUpperCase()}</td>
                                        <td style={{ fontWeight: 600 }}>{p.title || p.code}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{p.discountType === 'flat' ? `Flat ₹${p.discountFlat}` : `${p.discountPercentage}% Off`}</td>
                                        <td><span className="sa-badge" style={{ background: '#f1f2f6', color: '#2f3640' }}>{p.scope}</span></td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Until {new Date(p.validUntil).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`sa-badge ${p.isActive ? 'sa-badge-green' : 'sa-badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => openModal(p)}>Edit</button>
                                                <button
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.isActive ? 'var(--primary)' : 'var(--text-muted)', padding: '4px', display: 'flex' }}
                                                    title={p.isActive ? 'Deactivate' : 'Activate'}
                                                    onClick={() => toggleStatus(p)}
                                                >
                                                    {p.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                </button>
                                                <button
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '4px', display: 'flex' }}
                                                    title="Delete"
                                                    onClick={() => confirmDelete(p._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="sa-modal-card">
                        <X size={20} className="sa-modal-close" onClick={() => setIsModalOpen(false)} />
                        <h3 className="sa-modal-title">{editingId ? 'Edit Promotion' : 'Create Promotion'}</h3>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="sa-form-label">Promotion Title</label>
                                <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            </div>
                            <div>
                                <label className="sa-form-label">Promo Code (Identifier)</label>
                                <input type="text" className="form-control" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                            </div>
                            <div>
                                <label className="sa-form-label">Description</label>
                                <input type="text" className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="sa-form-label">Discount Type</label>
                                    <select className="form-control" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                                        <option value="percentage">Percentage</option>
                                        <option value="flat">Flat Amount</option>
                                    </select>
                                </div>
                                {formData.discountType === 'percentage' ? (
                                    <div>
                                        <label className="sa-form-label">Percentage (%)</label>
                                        <input type="number" className="form-control" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: Number(e.target.value)})} />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="sa-form-label">Flat Amount (₹)</label>
                                        <input type="number" className="form-control" value={formData.discountFlat} onChange={e => setFormData({...formData, discountFlat: Number(e.target.value)})} />
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="sa-form-label">Max Discount (₹)</label>
                                    <input type="number" className="form-control" value={formData.maxDiscountAmount} onChange={e => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})} required />
                                </div>
                                <div>
                                    <label className="sa-form-label">Min Order Value (₹)</label>
                                    <input type="number" className="form-control" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="sa-form-label">Scope</label>
                                    <select className="form-control" value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})}>
                                        <option value="Global">Global</option>
                                        <option value="City">City-specific</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="sa-form-label">Valid Until</label>
                                    <input type="date" className="form-control" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} required />
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                                {editingId ? 'Save Changes' : 'Create Promotion'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsDeleteModalOpen(false); }}>
                    <div className="sa-modal-card">
                        <X size={20} className="sa-modal-close" onClick={() => setIsDeleteModalOpen(false)} />
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F8D7DA', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                            <Trash2 size={22} />
                        </div>
                        <h3 className="sa-modal-title">Delete Promotion</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Are you sure you want to delete this promotion? This action cannot be undone.</p>
                        
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ background: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SuperadminPromotions;
