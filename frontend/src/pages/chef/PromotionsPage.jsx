import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Megaphone, Plus, Star, Search, Clock, CheckCircle2, XCircle, Share2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const PromotionsPage = () => {
    const { user } = useContext(AuthContext);
    const [campaigns, setCampaigns] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    const [formData, setFormData] = useState({
        type: 'Featured Kitchen',
        menuItem: '',
        startDate: '',
        endDate: '',
        budget: '',
        notes: ''
    });

    useEffect(() => {
        if (user) {
            fetchCampaigns();
            fetchMenuItems();
        }
    }, [user]);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${API_URL}/marketing/campaigns`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setCampaigns(await res.json());
        } catch (error) {
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const res = await fetch(`${API_URL}/menu?chef=${user._id}`);
            if (res.ok) setMenuItems(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/marketing/campaigns`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Campaign request submitted!');
                setIsCreating(false);
                fetchCampaigns();
                setFormData({ type: 'Featured Kitchen', menuItem: '', startDate: '', endDate: '', budget: '', notes: '' });
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to submit campaign');
            }
        } catch (error) {
            toast.error('Error submitting campaign');
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Active': return <CheckCircle2 size={16} color="#27ae60" />;
            case 'Rejected': return <XCircle size={16} color="#e74c3c" />;
            case 'Completed': return <CheckCircle2 size={16} color="#9e9e9e" />;
            default: return <Clock size={16} color="#f39c12" />; // Pending
        }
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'Featured Kitchen': return <Star size={16} color="#f1c40f" />;
            case 'Promote Dish': return <Search size={16} color="#3498db" />;
            case 'Social Media': return <Share2 size={16} color="#9b59b6" />;
            case 'Customer Re-engagement': return <Users size={16} color="#e74c3c" />;
            default: return <Megaphone size={16} />;
        }
    };

    return (
        <div style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Megaphone color="var(--primary)" size={28} /> Marketing Campaigns
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Request placement on the homepage, social media, or promote specific dishes.</p>
                </div>
                {!isCreating && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={16} /> New Campaign
                    </button>
                )}
            </div>

            {isCreating && (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', color: '#0F3F26' }}>Request New Campaign</h2>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Campaign Type</label>
                            <select className="form-control" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="Featured Kitchen">Featured Kitchen (Homepage Banner)</option>
                                <option value="Promote Dish">Promote Specific Dish (Top of Search)</option>
                                <option value="Social Media">Social Media Post Request</option>
                                <option value="Customer Re-engagement">Customer Re-engagement Email/SMS</option>
                            </select>
                        </div>

                        {formData.type === 'Promote Dish' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Select Dish to Promote</label>
                                <select className="form-control" required value={formData.menuItem} onChange={e => setFormData({...formData, menuItem: e.target.value})}>
                                    <option value="">-- Select a Dish --</option>
                                    {menuItems.map(item => (
                                        <option key={item._id} value={item._id}>{item.name} (₹{item.price})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Start Date</label>
                                <input type="date" className="form-control" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>End Date</label>
                                <input type="date" className="form-control" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Budget (Optional ₹)</label>
                            <input type="number" className="form-control" placeholder="How much are you willing to spend?" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Additional Notes</label>
                            <textarea className="form-control" rows="3" placeholder="Any specific requirements or target audience?" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsCreating(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Submit Request</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Megaphone size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>You haven't requested any marketing campaigns yet.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F8F9FA', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Campaign</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Duration</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Budget</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(camp => (
                                <tr key={camp._id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 800, color: '#0F3F26', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getTypeIcon(camp.type)} {camp.type}
                                        </div>
                                        {camp.menuItem && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                                                Target: {camp.menuItem.name}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Requested: {new Date(camp.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                        {camp.startDate ? new Date(camp.startDate).toLocaleDateString() : 'N/A'} <br/>
                                        <span style={{ color: 'var(--text-muted)' }}>to</span> <br/>
                                        {camp.endDate ? new Date(camp.endDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                        {camp.budget ? `₹${camp.budget}` : '-'}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {getStatusIcon(camp.status)} {camp.status}
                                        </div>
                                        {camp.adminFeedback && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--error)', marginTop: '4px', maxWidth: '150px', margin: '4px auto 0' }}>
                                                "{camp.adminFeedback}"
                                            </div>
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

export default PromotionsPage;
