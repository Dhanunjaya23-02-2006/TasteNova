import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Plus, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ChefSupportPage = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: 'other',
        priority: 'normal'
    });
    
    // For viewing a specific ticket
    const [activeTicket, setActiveTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');

    useEffect(() => {
        if (user) fetchTickets();
    }, [user]);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_URL}/support`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setTickets(await res.json());
        } catch (error) { console.error('Error fetching tickets', error); }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/support`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                toast.success('Ticket created successfully');
                setIsFormOpen(false);
                setFormData({ subject: '', description: '', category: 'other', priority: 'normal' });
                fetchTickets();
            } else {
                toast.error('Failed to create ticket');
            }
        } catch (error) { toast.error('An error occurred'); }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;
        
        try {
            const res = await fetch(`${API_URL}/support/${activeTicket._id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ message: replyMessage })
            });
            
            if (res.ok) {
                const updatedTicket = await res.json();
                setActiveTicket(updatedTicket);
                setReplyMessage('');
                fetchTickets(); // Refresh list to update statuses
            } else {
                toast.error('Failed to send reply');
            }
        } catch (error) { toast.error('An error occurred'); }
    };

    const handleCloseTicket = async () => {
        if (!window.confirm('Are you sure you want to close this ticket?')) return;
        try {
            const res = await fetch(`${API_URL}/support/${activeTicket._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status: 'closed' })
            });
            
            if (res.ok) {
                toast.success('Ticket closed');
                setActiveTicket(null);
                fetchTickets();
            }
        } catch (error) { toast.error('Failed to close ticket'); }
    };

    const viewTicket = async (id) => {
        try {
            const res = await fetch(`${API_URL}/support/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setActiveTicket(await res.json());
        } catch (error) { toast.error('Error loading ticket details'); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return { bg: '#e8f4fd', color: '#2196f3' };
            case 'in_progress': return { bg: '#fff8e1', color: '#ffb300' };
            case 'waiting_for_chef': return { bg: '#fce4ec', color: '#e91e63' };
            case 'resolved': return { bg: '#e8f5e9', color: '#4caf50' };
            case 'closed': return { bg: '#eeeeee', color: '#9e9e9e' };
            default: return { bg: '#eeeeee', color: '#9e9e9e' };
        }
    };

    const categories = [
        { value: 'order_issue', label: 'Order Issue' },
        { value: 'payment_payout_issue', label: 'Payment/Payout Issue' },
        { value: 'customer_issue', label: 'Customer Issue' },
        { value: 'menu_issue', label: 'Menu Issue' },
        { value: 'kitchen_account_issue', label: 'Kitchen/Account Issue' },
        { value: 'technical_issue', label: 'Technical Issue' },
        { value: 'other', label: 'Other' }
    ];

    if (activeTicket) {
        return (
            <div style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <button onClick={() => setActiveTicket(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            &larr; Back to Tickets
                        </button>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>{activeTicket.subject}</h1>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span>Ticket: {activeTicket.ticketNumber}</span>
                            <span>•</span>
                            <span>{new Date(activeTicket.createdAt).toLocaleString()}</span>
                            <span>•</span>
                            <span style={{ 
                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                                background: getStatusColor(activeTicket.status).bg, 
                                color: getStatusColor(activeTicket.status).color 
                            }}>
                                {activeTicket.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    {activeTicket.status !== 'closed' && activeTicket.status !== 'resolved' && (
                        <button onClick={handleCloseTicket} className="btn" style={{ background: '#fff', border: '1px solid var(--border-subtle)', color: 'var(--error)' }}>
                            Close Ticket
                        </button>
                    )}
                </div>

                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    {/* Original Description */}
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', background: '#F8F9FA' }}>
                        <div style={{ fontWeight: 700, marginBottom: '8px', color: '#0F3F26' }}>Original Request</div>
                        <p style={{ margin: 0, color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{activeTicket.description}</p>
                    </div>

                    {/* Conversation History */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                        {activeTicket.messages.map((msg, idx) => {
                            const isMe = msg.sender._id === user._id;
                            return (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        {isMe ? 'You' : msg.sender.name} • {new Date(msg.createdAt).toLocaleString()}
                                    </div>
                                    <div style={{ 
                                        background: isMe ? '#27ae60' : '#f1f3f5', 
                                        color: isMe ? '#fff' : 'var(--text-main)',
                                        padding: '12px 16px', 
                                        borderRadius: '12px',
                                        maxWidth: '80%',
                                        borderTopRightRadius: isMe ? 0 : '12px',
                                        borderTopLeftRadius: !isMe ? 0 : '12px',
                                        lineHeight: '1.5',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {msg.message}
                                    </div>
                                </div>
                            );
                        })}
                        {activeTicket.messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                                No replies yet.
                            </div>
                        )}
                    </div>

                    {/* Reply Box */}
                    {activeTicket.status !== 'closed' && activeTicket.status !== 'resolved' && (
                        <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                            <form onSubmit={handleReply} style={{ display: 'flex', gap: '12px' }}>
                                <textarea 
                                    className="input" 
                                    placeholder="Type your reply here..." 
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    style={{ flex: 1, minHeight: '60px', resize: 'vertical' }}
                                    required
                                />
                                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                                    Send Reply
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Support Tickets</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Need help? Create a ticket and our support team will assist you.</p>
                </div>
                <button onClick={() => setIsFormOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Create New Ticket
                </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: '#F8F9FA' }}>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Ticket ID</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Subject & Category</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Last Updated</th>
                            <th style={{ textAlign: 'center', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No support tickets found.</td>
                            </tr>
                        ) : (
                            tickets.map(ticket => (
                                <tr key={ticket._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 700, color: '#0F3F26', fontSize: '0.9rem' }}>
                                        {ticket.ticketNumber}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{ticket.subject}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ticket.category.replace(/_/g, ' ')}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                                            background: getStatusColor(ticket.status).bg, 
                                            color: getStatusColor(ticket.status).color 
                                        }}>
                                            {ticket.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(ticket.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <button onClick={() => viewTicket(ticket._id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Ticket Modal */}
            {isFormOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0F3F26' }}>Create Support Ticket</h2>
                            <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle color="var(--text-muted)" /></button>
                        </div>
                        
                        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Category</label>
                                <select className="input" style={{ width: '100%' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                                    {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Subject</label>
                                <input type="text" className="input" style={{ width: '100%' }} value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required placeholder="E.g., Payment missing for Order #TN1234" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
                                <textarea className="input" style={{ width: '100%', minHeight: '120px', resize: 'vertical' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Provide details about your issue..." />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="btn" style={{ background: '#eee', color: 'var(--text-main)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChefSupportPage;
