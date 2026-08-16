import React, { useState, useEffect, useContext, useRef } from 'react';
import { HelpCircle, MessageCircle, PhoneCall, Mail, ArrowLeft, Send, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SupportTab = () => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('overview'); // 'overview', 'create', 'history', 'chat'
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [socket, setSocket] = useState(null);

    // Create ticket state
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('other');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

    // Chat state
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (view === 'history') {
            fetchTickets();
        }
    }, [view]);

    useEffect(() => {
        if (activeTicket && view === 'chat') {
            const newSocket = io(API_URL.replace('/api', ''), {
                auth: { token: user.token }
            });

            newSocket.on('connect', () => {
                newSocket.emit('join_ticket', activeTicket._id);
            });

            newSocket.on('new_ticket_message', (updatedTicket) => {
                setActiveTicket(updatedTicket);
            });

            newSocket.on('ticket_status_update', (updatedTicket) => {
                setActiveTicket(prev => ({ ...prev, status: updatedTicket.status, resolvedAt: updatedTicket.resolvedAt }));
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        }
    }, [activeTicket?._id, view]);

    useEffect(() => {
        if (view === 'chat') scrollToBottom();
    }, [activeTicket?.messages, view]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${API_URL}/support`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setTickets(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch tickets');
        }
    };

    const fetchTicketById = async (id) => {
        try {
            const res = await fetch(`${API_URL}/support/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setActiveTicket(await res.json());
                setView('chat');
            }
        } catch (error) {
            console.error('Failed to fetch ticket');
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!subject || !description) return toast.error('Please fill all fields');
        setCreating(true);
        try {
            const res = await fetch(`${API_URL}/support`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ subject, category, description })
            });
            
            if (res.ok) {
                const newTicket = await res.json();
                toast.success('Ticket created');
                setSubject('');
                setDescription('');
                fetchTicketById(newTicket._id);
            } else {
                toast.error('Failed to create ticket');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setCreating(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeTicket) return;

        const text = messageText;
        setMessageText(''); 

        try {
            const res = await fetch(`${API_URL}/support/${activeTicket._id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ message: text })
            });

            if (!res.ok) {
                setMessageText(text); 
                toast.error('Failed to send message');
            }
        } catch (error) {
            setMessageText(text);
            toast.error('An error occurred');
        }
    };

    if (view === 'create') {
        return (
            <div className="animate-fade-up" style={{ maxWidth: '600px' }}>
                <button onClick={() => setView('overview')} className="btn btn-outline" style={{ border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, marginBottom: '24px' }}>
                    <ArrowLeft size={18} /> Back to Support
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Create Support Ticket</h2>
                
                <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Category</label>
                        <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="order_issue">Order Issue</option>
                            <option value="food_quality">Food Quality</option>
                            <option value="delivery_issue">Delivery Issue</option>
                            <option value="refund_request">Refund Request</option>
                            <option value="technical_issue">Technical Issue</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Subject</label>
                        <input type="text" className="form-control" placeholder="Brief summary of the issue" value={subject} onChange={e => setSubject(e.target.value)} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Description</label>
                        <textarea className="form-control" rows="5" placeholder="Please describe the issue in detail..." value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={creating}>
                        {creating ? 'Creating...' : 'Submit Ticket'}
                    </button>
                </form>
            </div>
        );
    }

    if (view === 'history') {
        return (
            <div className="animate-fade-up" style={{ maxWidth: '800px' }}>
                <button onClick={() => setView('overview')} className="btn btn-outline" style={{ border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, marginBottom: '24px' }}>
                    <ArrowLeft size={18} /> Back to Support
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>My Tickets</h2>
                    <button onClick={() => setView('create')} className="btn btn-primary" style={{ padding: '8px 16px' }}>New Ticket</button>
                </div>

                {tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <p style={{ color: 'var(--text-muted)' }}>You don't have any support tickets yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {tickets.map(t => (
                            <div key={t._id} onClick={() => fetchTicketById(t._id)} style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px', fontWeight: 600 }}>{t.subject}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket #{t.ticketNumber} • {new Date(t.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: t.status === 'resolved' || t.status === 'closed' ? '#E8F5E9' : '#FFF3E0', color: t.status === 'resolved' || t.status === 'closed' ? '#2E7D32' : '#EF6C00' }}>
                                    {t.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (view === 'chat' && activeTicket) {
        return (
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px', maxWidth: '800px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)' }}>
                    <button onClick={() => setView('history')} className="btn btn-outline" style={{ border: 'none', padding: '8px' }}><ArrowLeft size={20} /></button>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{activeTicket.subject}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket #{activeTicket.ticketNumber} • {activeTicket.status.replace(/_/g, ' ')}</p>
                    </div>
                </div>

                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}><strong>Original Query:</strong> {activeTicket.description}</p>
                    </div>

                    {activeTicket.messages.map((msg, idx) => {
                        const isMine = msg.sender._id === user.id || msg.sender === user.id;
                        return (
                            <div key={idx} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                <div style={{ background: isMine ? 'var(--primary)' : 'var(--bg-body)', color: isMine ? '#fff' : 'var(--text-main)', padding: '12px 16px', borderRadius: '16px', borderBottomRightRadius: isMine ? '4px' : '16px', borderBottomLeftRadius: !isMine ? '4px' : '16px', boxShadow: 'var(--shadow-sm)', border: !isMine ? '1px solid var(--border-subtle)' : 'none' }}>
                                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.message}</p>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: isMine ? 'right' : 'left' }}>
                                    {isMine ? 'You' : msg.sender?.name || 'Support'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {activeTicket.status !== 'resolved' && activeTicket.status !== 'closed' ? (
                    <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', background: 'var(--bg-card)' }}>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Type your message..." 
                            value={messageText} 
                            onChange={e => setMessageText(e.target.value)}
                            style={{ flex: 1, borderRadius: '24px', padding: '12px 20px' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={!messageText.trim()}>
                            <Send size={20} />
                        </button>
                    </form>
                ) : (
                    <div style={{ padding: '16px', textAlign: 'center', background: 'var(--bg-body)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
                        This ticket has been marked as resolved.
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(252, 128, 25, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
                    <HelpCircle size={40} />
                </div>
                <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '12px' }}>How can we help you?</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto', marginBottom: '20px' }}>
                    Have an issue with an order or need help with your account? Our support team is here for you.
                </p>
                <button onClick={() => setView('history')} className="btn btn-outline" style={{ padding: '8px 24px', borderRadius: '20px', fontSize: '0.9rem' }}>
                    View My Support Tickets
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <MessageCircle size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '8px' }}>Chat with us</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Get instant help from our AI or a live agent.</p>
                    <button onClick={() => setView('create')} className="btn btn-outline" style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>Start Chat</button>
                </div>
                
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <PhoneCall size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '8px' }}>Call Support</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Available 8:00 AM to 11:00 PM everyday.</p>
                    <button className="btn btn-outline" style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>1800-123-4567</button>
                </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>Frequently Asked Questions</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '8px' }}>Where is my order?</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>You can track your active orders in real-time by going to the <Link to="/account/orders" style={{ color: 'var(--primary)' }}>Orders</Link> tab and clicking 'Track Order'.</p>
                    </div>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '8px' }}>How do I cancel my subscription?</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>Go to your <Link to="/account/subscriptions" style={{ color: 'var(--primary)' }}>Subscriptions</Link> tab, select the active meal plan, and click 'Cancel'.</p>
                    </div>
                    <div style={{ padding: '20px 24px' }}>
                        <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '8px' }}>Can I change my delivery address?</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>Yes, you can manage your addresses in the <Link to="/account/addresses" style={{ color: 'var(--primary)' }}>Addresses</Link> tab.</p>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Still need help? Email us at <a href="mailto:support@tastenova.com" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>support@tastenova.com</a>
                </p>
            </div>

        </div>
    );
};

export default SupportTab;
