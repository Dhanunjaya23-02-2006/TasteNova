import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Ticket, Plus, Tag, Trash2, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const OffersCouponsPage = () => {
    const { user } = useContext(AuthContext);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountPercentage: '',
        discountFlat: '',
        maxDiscountAmount: '',
        minOrderValue: 0,
        validUntil: ''
    });

    useEffect(() => {
        if (user) fetchOffers();
    }, [user]);

    const fetchOffers = async () => {
        try {
            const res = await fetch(`${API_URL}/offers`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setOffers(await res.json());
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/offers`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Offer created successfully!');
                setIsCreating(false);
                fetchOffers();
                setFormData({
                    code: '', description: '', discountType: 'percentage', 
                    discountPercentage: '', discountFlat: '', maxDiscountAmount: '', 
                    minOrderValue: 0, validUntil: ''
                });
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to create offer');
            }
        } catch (error) {
            toast.error('Error creating offer');
        }
    };

    const isExpired = (date) => new Date(date) < new Date();

    return (
        <div style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Ticket color="var(--primary)" size={28} /> Offers & Coupons
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Create and manage discount codes for your customers.</p>
                </div>
                {!isCreating && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={16} /> Create Offer
                    </button>
                )}
            </div>

            {isCreating && (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', color: '#0F3F26' }}>Create New Offer</h2>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Offer Code (e.g. SUMMER20)</label>
                                <input type="text" className="form-control" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Valid Until</label>
                                <input type="date" className="form-control" required value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Description</label>
                            <input type="text" className="form-control" required value={formData.description} placeholder="e.g. Get 20% off on all orders this weekend" onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Discount Type</label>
                                <select className="form-control" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="flat">Flat Amount (₹)</option>
                                </select>
                            </div>
                            {formData.discountType === 'percentage' ? (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Discount Percentage (%)</label>
                                    <input type="number" className="form-control" max="100" min="1" required value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} />
                                </div>
                            ) : (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Flat Discount (₹)</label>
                                    <input type="number" className="form-control" min="1" required value={formData.discountFlat} onChange={e => setFormData({...formData, discountFlat: e.target.value})} />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Max Discount Amount (₹)</label>
                                <input type="number" className="form-control" required value={formData.maxDiscountAmount} onChange={e => setFormData({...formData, maxDiscountAmount: e.target.value})} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Min Order Value (₹)</label>
                                <input type="number" className="form-control" required value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsCreating(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Create Offer</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading offers...</div>
                ) : offers.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Tag size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>No active offers found. Create one to boost your sales!</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F8F9FA', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Offer Code</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Discount</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Valid Until</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map(offer => (
                                <tr key={offer._id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 800, color: '#0F3F26', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Tag size={16} color="var(--primary)" /> {offer.code}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{offer.description}</div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                        {offer.discountType === 'percentage' ? `${offer.discountPercentage}% off` : `₹${offer.discountFlat} off`}
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max ₹{offer.maxDiscountAmount} • Min ₹{offer.minOrderValue}</div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                        {new Date(offer.validUntil).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {isExpired(offer.validUntil) ? (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: '#f5f5f5', color: '#9e9e9e', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} /> Expired
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: '#EAF5F0', color: '#27ae60', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle2 size={12} /> Active
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OffersCouponsPage;
