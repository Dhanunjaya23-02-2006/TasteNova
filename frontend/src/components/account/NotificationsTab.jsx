import React, { useState, useEffect, useContext } from 'react';
import { Bell, PackageCheck, Gift, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { SocketContext } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const NotificationsTab = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${API_URL}/notifications`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Error fetching notifications", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        if (!socket) return;
        
        const handleNewNotification = (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            toast.success(newNotif.title || 'New Notification', { icon: '🔔' });
        };

        socket.on('new_notification', handleNewNotification);
        
        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket]);

    const handleMarkAsRead = async (id, e) => {
        // Only call API if we aren't clicking the wrapper link directly, or let the link proceed if it's a normal click
        try {
            const res = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const res = await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                toast.success('All notifications marked as read');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to mark as read');
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'order': return <PackageCheck size={20} color="#2ed573" />;
            case 'wallet': return <CreditCard size={20} color="#3498db" />;
            case 'promo': return <Gift size={20} color="#9b59b6" />;
            default: return <Bell size={20} color="var(--primary)" />;
        }
    };

    const getBgColor = (type) => {
        switch(type) {
            case 'order': return 'rgba(46, 213, 115, 0.1)';
            case 'wallet': return 'rgba(52, 152, 219, 0.1)';
            case 'promo': return 'rgba(155, 89, 182, 0.1)';
            default: return 'rgba(23, 107, 69, 0.1)';
        }
    };

    if (loading) {
        return <div className="animate-fade-up" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading notifications...</div>;
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Notifications</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Stay updated on your orders, wallet, and exclusive offers.</p>
                </div>
                
                <button onClick={handleMarkAllAsRead} className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}>
                    Mark all as read
                </button>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                {notifications.length > 0 ? (
                    notifications.map((notif, idx) => (
                        <Link 
                            to={notif.link || '#'}
                            key={notif._id} 
                            onClick={(e) => {
                                if (!notif.isRead) {
                                    handleMarkAsRead(notif._id, e);
                                }
                            }}
                            style={{ 
                                display: 'flex', 
                                gap: '16px', 
                                padding: '20px 24px', 
                                borderBottom: idx !== notifications.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                background: notif.isRead ? 'var(--bg-surface)' : 'rgba(23, 107, 69, 0.03)',
                                textDecoration: 'none',
                                position: 'relative',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                            onMouseOut={(e) => e.currentTarget.style.background = notif.isRead ? 'var(--bg-surface)' : 'rgba(23, 107, 69, 0.03)'}
                        >
                            {!notif.isRead && (
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--primary)' }}></div>
                            )}
                            
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: getBgColor(notif.type), display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                {getIcon(notif.type)}
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>{notif.title}</h3>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    {notif.body || notif.message}
                                </p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: '80px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {new Date(notif.createdAt || notif.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {notif.link && (
                                    <ChevronRight size={18} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <Bell size={48} style={{ color: 'var(--border)', margin: '0 auto 16px' }} />
                        <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '8px' }}>All caught up!</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You don't have any new notifications right now.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default NotificationsTab;
