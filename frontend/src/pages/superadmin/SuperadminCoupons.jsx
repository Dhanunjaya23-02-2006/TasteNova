import React, { useState, useEffect, useContext } from 'react';
import { Search, Ticket, Users, Copy, X, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminCoupons = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [search, setSearch] = useState('');
    const [coupons, setCoupons] = useState([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        code: '', description: '', discountType: 'percentage', discountPercentage: 10, discountFlat: 0,
        maxDiscountAmount: 100, minOrderValue: 200, usageLimit: 0, scope: 'Global', validUntil: ''
    });

    const fetchCoupons = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/offers`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) {
                const data = await res.json();
                setCoupons(data.filter(o => o.type === 'coupon'));
            }
        } catch(e) { console.error(e); }
    };

    useEffect(() => { if(user) fetchCoupons(); }, [user, lastUpdated]);

    const openModal = (coupon = null) => {
        if(coupon) {
            setEditingId(coupon._id);
            setFormData({
                code: coupon.code, description: coupon.description, discountType: coupon.discountType,
                discountPercentage: coupon.discountPercentage || 0, discountFlat: coupon.discountFlat || 0,
                maxDiscountAmount: coupon.maxDiscountAmount, minOrderValue: coupon.minOrderValue,
                usageLimit: coupon.usageLimit || 0,
                scope: coupon.scope, validUntil: new Date(coupon.validUntil).toISOString().split('T')[0]
            });
        } else {
            setEditingId(null);
            setFormData({ code: '', description: '', discountType: 'percentage', discountPercentage: 10, discountFlat: 0, maxDiscountAmount: 100, minOrderValue: 200, usageLimit: 0, scope: 'Global', validUntil: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${API_URL}/superadmin/marketing/offers/${editingId}` : `${API_URL}/superadmin/marketing/offers`;
            
            const payload = { ...formData, type: 'coupon' };
            if (payload.discountType === 'percentage') payload.discountFlat = 0;
            else payload.discountPercentage = 0;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingId ? 'Coupon updated' : 'Coupon created');
                setIsModalOpen(false);
                fetchCoupons();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Error saving coupon');
            }
        } catch (e) { toast.error('An error occurred'); }
    };

    const toggleStatus = async (coupon) => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/offers/${coupon._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ isActive: !coupon.isActive })
            });
            if (res.ok) {
                toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`);
                fetchCoupons();
            }
        } catch (e) { toast.error('Error toggling status'); }
    };

    const confirmDelete = (id) => {
        setCouponToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if(!couponToDelete) return;
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/offers/${couponToDelete}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
            if(res.ok) { 
                toast.success('Coupon deleted'); 
                fetchCoupons(); 
                setIsDeleteModalOpen(false); 
                setCouponToDelete(null); 
            } else toast.error('Error deleting coupon');
        } catch(e) { toast.error('Error deleting coupon'); }
    };


    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Coupon Codes</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Generate and track customer-facing promo codes.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => openModal()}>
                        <Ticket size={16} /> Generate Coupon
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Ticket size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Coupons</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{coupons.filter(c => c.isActive).length}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Redemptions</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)}</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 className="sa-modal-title">Coupon List</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="sa-search" style={{ paddingLeft: '32px', width: '250px' }} placeholder="Search codes..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount Type</th>
                                <th>Min. Order</th>
                                <th>Usage Limit</th>
                                <th>Redeemed</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No coupons found</td></tr>
                            ) : (
                                coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase())).map(c => (
                                    <tr key={c._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px', background: 'rgba(23, 107, 69, 0.08)', padding: '4px 8px', borderRadius: '6px' }}>{c.code}</span>
                                                <Copy size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Code copied'); }} />
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{c.discountType === 'flat' ? `Flat ₹${c.discountFlat}` : `${c.discountPercentage}% Off`}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>₹{c.minOrderValue}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{c.usageLimit === 0 ? 'Unlimited' : c.usageLimit}</td>
                                        <td style={{ fontWeight: 600 }}>{c.usageCount || 0}</td>
                                        <td>
                                            <span className={`sa-badge ${c.isActive ? 'sa-badge-green' : 'sa-badge-red'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => openModal(c)}>Edit</button>
                                                <button
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.isActive ? 'var(--primary)' : 'var(--text-muted)', padding: '4px', display: 'flex' }}
                                                    title={c.isActive ? 'Deactivate' : 'Activate'}
                                                    onClick={() => toggleStatus(c)}
                                                >
                                                    {c.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                </button>
                                                <button
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '4px', display: 'flex' }}
                                                    title="Delete"
                                                    onClick={() => confirmDelete(c._id)}
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

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="sa-modal-card">
                        <X size={20} className="sa-modal-close" onClick={() => setIsModalOpen(false)} />
                        <h3 className="sa-modal-title">{editingId ? 'Edit Coupon' : 'Generate Coupon'}</h3>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="sa-form-label">Coupon Code</label>
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
                                    <label className="sa-form-label">Usage Limit</label>
                                    <input type="number" className="form-control" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} placeholder="0 = Unlimited" />
                                </div>
                                <div>
                                    <label className="sa-form-label">Valid Until</label>
                                    <input type="date" className="form-control" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} required />
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                                {editingId ? 'Save Changes' : 'Create Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsDeleteModalOpen(false); }}>
                    <div className="sa-modal-card">
                        <X size={20} className="sa-modal-close" onClick={() => setIsDeleteModalOpen(false)} />
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F8D7DA', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                            <Trash2 size={22} />
                        </div>
                        <h3 className="sa-modal-title">Delete Coupon</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Are you sure you want to delete this coupon? This action cannot be undone.</p>
                        
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

export default SuperadminCoupons;
