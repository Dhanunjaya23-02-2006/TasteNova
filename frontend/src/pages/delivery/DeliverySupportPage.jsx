import React, { useState, useEffect } from 'react';
import { HelpCircle, AlertTriangle, MessageSquare, Phone, Package, ChevronRight, Plus, X, Loader } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const DeliverySupportPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ subject: '', description: '', priority: 'medium' });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/support');
            setTickets(res.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await api.post('/support', formData);
            toast.success('Support ticket created successfully');
            setShowModal(false);
            setFormData({ subject: '', description: '', priority: 'medium' });
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create ticket');
        }
    };

    const issues = [
        { icon: Package, title: 'Active Delivery Problem', desc: 'Customer unavailable, wrong address', subject: 'Delivery Issue' },
        { icon: AlertTriangle, title: 'Pickup Problem', desc: 'Chef not responding, food not ready', subject: 'Pickup Issue' },
        { icon: HelpCircle, title: 'Payment Problem', desc: 'Missing earnings, incentive issues', subject: 'Payment Issue' },
        { icon: MessageSquare, title: 'App Problem', desc: 'GPS issues, app crashing', subject: 'App Issue' },
    ];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 24px', color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>Help & Support</h1>
            
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-main)' }}>What do you need help with?</h3>
            
            <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
                {issues.map((issue, i) => (
                    <button 
                        key={i} 
                        onClick={() => {
                            setFormData({ ...formData, subject: issue.subject });
                            setShowModal(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '12px', borderRadius: '50%' }}>
                                <issue.icon size={24} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{issue.title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{issue.desc}</div>
                            </div>
                        </div>
                        <ChevronRight size={20} color="var(--text-muted)" />
                    </button>
                ))}
            </div>

            <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
                <Phone size={32} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 8px' }}>Need immediate help?</h3>
                <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Our support team is available 24/7 for active delivery partners.</p>
                <button onClick={() => setShowModal(true)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Create Support Ticket
                </button>
            </div>

            <h3 style={{ margin: '0 0 16px', color: 'var(--text-main)' }}>My Recent Tickets</h3>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}><Loader className="spin" size={24} /></div>
            ) : tickets.length === 0 ? (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No support tickets found.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tickets.map(ticket => (
                        <div key={ticket._id} style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{ticket.subject}</h4>
                                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: ticket.status === 'open' ? '#fff3cd' : '#d1e7dd', color: ticket.status === 'open' ? '#856404' : '#0f5132' }}>{ticket.status}</span>
                            </div>
                            <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{ticket.description}</p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Ticket Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: "'DM Serif Display', serif" }}>Create Ticket</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>Subject</label>
                                <input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} type="text" placeholder="What is the issue about?" style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Please describe the issue in detail..." rows="4" style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', resize: 'vertical' }}></textarea>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>Priority</label>
                                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: '#fff' }}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: '8px' }}>
                                Submit Ticket
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliverySupportPage;
