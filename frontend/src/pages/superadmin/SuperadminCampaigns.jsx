import React, { useState, useEffect, useContext } from 'react';
import { Send, Smartphone, Mail, Activity, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const SuperadminCampaigns = () => {
    const { user } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [campaigns, setCampaigns] = useState([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState('Active');

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/campaigns`, { headers: { Authorization: `Bearer ${user.token}` } });
            if(res.ok) setCampaigns(await res.json());
        } catch(e) { console.error(e); }
    };

    useEffect(() => { if(user) fetchCampaigns(); }, [user]);

    const openModal = (campaign) => {
        setEditingCampaign(campaign);
        setFeedback(campaign.adminFeedback || '');
        setStatus(campaign.status === 'Pending' ? 'Active' : campaign.status);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/campaigns/${editingCampaign._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status, adminFeedback: feedback })
            });
            if(res.ok) {
                toast.success('Campaign updated');
                setIsModalOpen(false);
                fetchCampaigns();
            } else toast.error('Error updating campaign');
        } catch(e) { toast.error('Error updating campaign'); }
    };


    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Marketing Campaigns</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage Push Notifications and Email campaigns for user engagement.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => toast.success('Campaigns are requested by chefs and managed here')}>
                        <Send size={16} /> Manage Campaigns
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Campaigns</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{campaigns.filter(c => c.status === 'Active').length}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Requests</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{campaigns.filter(c => c.status === 'Pending').length}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Campaigns</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{campaigns.filter(c => c.status === 'Completed').length}</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Recent Campaigns</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="sa-search" style={{ paddingLeft: '32px', width: '250px' }} placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Campaign ID</th>
                                <th>Chef Name</th>
                                <th>Type</th>
                                <th>Budget</th>
                                <th>Start Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.filter(c => c.chef?.name?.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase())).map(c => (
                                <tr key={c._id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{c._id.substring(c._id.length - 8).toUpperCase()}</td>
                                    <td style={{ fontWeight: 600 }}>{c.chef?.name || 'Unknown'}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{c.type}</td>
                                    <td style={{ fontWeight: 600 }}>₹{c.budget}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{c.startDate ? new Date(c.startDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span className={`sa-badge ${c.status === 'Active' ? 'sa-badge-green' : c.status === 'Pending' ? 'sa-badge-blue' : c.status === 'Completed' ? 'sa-badge-green' : 'sa-badge-red'}`}>{c.status}</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => openModal(c)}>Review</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && editingCampaign && (
                <div className="modal-overlay">
                    <div className="sa-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsModalOpen(false)} />
                        <h3 style={{ margin: '0 0 20px 0' }}>Review Campaign Request</h3>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chef</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{editingCampaign.chef?.name}</p>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Campaign Type</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{editingCampaign.type}</p>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Notes from Chef</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>{editingCampaign.notes || 'No notes provided'}</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Status</label>
                                <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                                    <option value="Pending">Pending</option>
                                    <option value="Active">Active / Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Admin Feedback (Optional)</label>
                                <textarea className="form-control" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Reason for rejection or instructions..." rows="3" />
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                                Save Status
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperadminCampaigns;
