import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send, Bell, Mail, MessageSquare } from 'lucide-react';

const NotificationsTab = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [cities, setCities] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        targetAudience: 'All',
        targetCity: '',
        type: 'Push'
    });
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchCities();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/notifications`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setNotifications(await res.json());
        } catch (error) {
            console.error('Error fetching notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCities = async () => {
        try {
            const res = await fetch(`${API_URL}/cities`);
            if (res.ok) setCities(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/superadmin/marketing/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success(`${formData.type} sent successfully!`);
                setFormData({ title: '', body: '', targetAudience: 'All', targetCity: '', type: 'Push' });
                fetchNotifications();
            } else {
                toast.error(`Failed to send ${formData.type}`);
            }
        } catch (error) {
            toast.error('Error sending blast');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Communications Hub</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                {/* Compose Section */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Compose Blast</h3>
                    
                    {/* Type Selector */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        {['Push', 'Email', 'SMS'].map(t => (
                            <button 
                                key={t}
                                type="button"
                                className={`btn btn-${formData.type === t ? 'primary' : 'secondary'}`}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={() => setFormData({...formData, type: t})}
                            >
                                {t === 'Push' && <Bell size={16} />}
                                {t === 'Email' && <Mail size={16} />}
                                {t === 'SMS' && <MessageSquare size={16} />}
                                {t}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        <div className="input-group">
                            <label>Target Audience</label>
                            <select 
                                className="form-control" 
                                value={formData.targetAudience} 
                                onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                            >
                                <option value="All">Everyone (Customers, Chefs, Delivery)</option>
                                <option value="Customers">Customers Only</option>
                                <option value="Chefs">Chefs Only</option>
                                <option value="Delivery">Delivery Partners Only</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Target City (Optional)</label>
                            <select 
                                className="form-control" 
                                value={formData.targetCity} 
                                onChange={e => setFormData({...formData, targetCity: e.target.value})}
                            >
                                <option value="">Global (All Cities)</option>
                                {cities.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Title / Subject</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. Free Delivery Weekend!" 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Message Body</label>
                            <textarea 
                                className="form-control" 
                                placeholder="Write your message here..." 
                                rows="4"
                                value={formData.body} 
                                onChange={e => setFormData({...formData, body: e.target.value})} 
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            disabled={sending}
                        >
                            <Send size={18} />
                            {sending ? 'Sending...' : 'Send Blast'}
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Recent Blasts</h3>
                    {notifications.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No communication history.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {notifications.map(notif => (
                                <div key={notif._id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {notif.type === 'Push' && <Bell size={18} color="var(--primary)" />}
                                            {notif.type === 'Email' && <Mail size={18} color="var(--primary)" />}
                                            {notif.type === 'SMS' && <MessageSquare size={18} color="var(--primary)" />}
                                            <h4 style={{ margin: 0 }}>{notif.title}</h4>
                                        </div>
                                        <span className="status-badge status-success">{notif.status}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{notif.body}</p>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                        <span><strong>To:</strong> {notif.targetAudience} {notif.targetCity ? `(${notif.targetCity.name})` : '(Global)'}</span>
                                        <span><strong>By:</strong> {notif.sentBy?.name || 'System'}</span>
                                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
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

export default NotificationsTab;
