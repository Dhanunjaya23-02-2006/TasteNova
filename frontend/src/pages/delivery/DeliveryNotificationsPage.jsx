import React, { useState, useEffect, useContext } from 'react';
import { Bell, AlertTriangle, CheckCircle, IndianRupee, MapPin, Loader, FileText, Info } from 'lucide-react';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import io from 'socket.io-client';
import { API_URL } from '../../config';

const DeliveryNotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user || !user.token) return;
        
        fetchNotifications();

        const socket = io(API_URL.replace('/api', ''), {
            auth: { token: user.token }
        });

        socket.on('connect', () => {
            socket.emit('join_user', user._id);
        });

        socket.on('new_notification', (data) => {
            fetchNotifications();
        });

        return () => socket.disconnect();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconInfo = (type) => {
        switch (type) {
            case 'order_update': return { icon: Bell, color: 'var(--primary)' };
            case 'payment': return { icon: IndianRupee, color: 'var(--success)' };
            case 'system': return { icon: Info, color: '#3498db' };
            case 'alert': return { icon: AlertTriangle, color: '#f39c12' };
            default: return { icon: Bell, color: 'var(--text-muted)' };
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader className="spin" size={32} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
                <div>Loading notifications...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 24px', color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>Alerts & Updates</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notifications.length === 0 && (
                    <div style={{ padding: '40px 20px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <p style={{ margin: 0 }}>You have no new notifications.</p>
                    </div>
                )}
                {notifications.map(notif => {
                    const { icon: Icon, color } = getIconInfo(notif.type);
                    return (
                        <div key={notif._id} style={{ display: 'flex', gap: '16px', background: notif.isRead ? '#fff' : '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', alignItems: 'flex-start' }}>
                            <div style={{ background: `${color}15`, color: color, padding: '12px', borderRadius: '50%' }}>
                                <Icon size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{notif.title}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{notif.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliveryNotificationsPage;
