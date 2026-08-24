import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, ShoppingBag, ChefHat, Wallet,
    Users, CalendarCheck, PartyPopper, Bell,
    ChevronDown, User, Settings, LogOut, Menu, X, HelpCircle,
    Home as HomeIcon, MoreHorizontal, Star, ShieldCheck, BarChart3, Megaphone, Ticket, TrendingUp
} from 'lucide-react';
import { API_URL } from '../config';
import { io } from 'socket.io-client';

const sidebarGroups = [
    {
        title: 'MAIN',
        items: [
            { to: '/chef/dashboard', label: 'Dashboard', icon: HomeIcon, end: true },
            { to: '/chef/orders', label: 'Orders', icon: ShoppingBag },
            { to: '/chef/menu', label: 'Menu Management', icon: ChefHat },
            { to: '/chef/party-orders', label: 'Bookings', icon: CalendarCheck },
            { to: '/chef/subscriptions', label: 'Subscriptions', icon: PartyPopper },
        ]
    },
    {
        title: 'BUSINESS',
        items: [
            { to: '/chef/earnings', label: 'Payouts & Earnings', icon: Wallet },
            { to: '/chef/reviews', label: 'Reviews & Ratings', icon: Star },
            { to: '/chef/growth', label: 'Analytics', icon: BarChart3 },
            { to: '/chef/marketing', label: 'Marketing Tools', icon: Megaphone, badge: 'New' },
        ]
    },
    {
        title: 'GROWTH',
        items: [
            { to: '/chef/growth-hub', label: 'Growth Hub', icon: TrendingUp },
            { to: '/chef/offers', label: 'Offers & Coupons', icon: Ticket },
            { to: '/chef/promotions', label: 'Promotions', icon: Megaphone },
            { to: '/chef/invite', label: 'Invite & Earn', icon: Users },
        ]
    },
    {
        title: 'ACCOUNT',
        items: [
            { to: '/chef/plans', label: 'Plans & Billing', icon: Wallet },
            { to: '/chef/settings', label: 'Kitchen Settings', icon: Settings },
            { to: '/chef/profile-settings', label: 'Profile', icon: User },
            { to: '/chef/support', label: 'Support Tickets', icon: HelpCircle },
        ]
    }
];

const mobileBottomNav = [
    { to: '/chef/dashboard', label: 'Home', icon: HomeIcon },
    { to: '/chef/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/chef/menu', label: 'Menu', icon: ChefHat },
    { action: 'more', label: 'More', icon: Menu },
];

const ChefLayout = () => {
    // Add class to body to ensure padding for bottom nav on mobile
    useEffect(() => {
        document.body.classList.add('has-mobile-bottom-nav');
        return () => document.body.classList.remove('has-mobile-bottom-nav');
    }, []);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const userRef = useRef(null);
    const notifRef = useRef(null);
    const [stats, setStats] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [kitchenOpen, setKitchenOpen] = useState(false);

    useEffect(() => {
        if (!user || (user.role !== 'chef' && user.role !== 'admin')) {
            navigate('/');
        } else {
            fetchStats();
            fetchKitchenStatus();
        }
    }, [user, navigate]);

    const fetchKitchenStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/users/profile`, { headers: { Authorization: `Bearer ${user?.token || user?.accessToken}` } });
            if (res.ok) {
                const data = await res.json();
                setKitchenOpen(!!data.isOpen);
            }
        } catch (e) { console.error(e); }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/chef/stats`, { headers: { Authorization: `Bearer ${user?.token}` } });
            if (res.ok) setStats(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${user?.token}` } });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!user) return;
        fetchNotifications();

        const socket = io(API_URL.replace('/api', ''), {
            auth: { token: user.token }
        });

        socket.emit('join_chef', user._id);

        socket.on('new_notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        // Listen for kitchen status changes from the dashboard
        const handleKitchenStatusChange = (e) => {
            if (e.detail !== undefined) setKitchenOpen(!!e.detail);
        };
        window.addEventListener('kitchenStatusChanged', handleKitchenStatusChange);

        return () => {
            socket.disconnect();
            window.removeEventListener('kitchenStatusChanged', handleKitchenStatusChange);
        };
    }, [user]);

    useEffect(() => {
        const handler = (e) => {
            if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const handleMarkAllRead = async () => {
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user || (user.role !== 'chef' && user.role !== 'admin')) return null;

    const navLinkStyle = ({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 16px', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', fontWeight: 600,
        color: isActive ? '#0F3F26' : 'var(--text-main)',
        background: isActive ? '#EAF5F0' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        marginBottom: '2px',
        borderLeft: isActive ? '4px solid #27ae60' : '4px solid transparent',
        marginLeft: '-12px'
    });

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F8F9FA', overflow: 'hidden' }}>

            {/* ─── FULL WIDTH TOP BAR ─── */}
            <header style={{
                height: '70px',
                background: '#fff',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                zIndex: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>T</div>
                        <span className="hide-on-mobile" style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: 'var(--text-main)' }}>TasteNova</span>
                        <span className="show-on-mobile" style={{ display: 'none', fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: 'var(--text-main)' }}>My Kitchen</span>
                    </div>

                    <div style={{ display: window.innerWidth > 600 ? 'flex' : 'none', alignItems: 'center', gap: '6px', background: kitchenOpen ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)', color: kitchenOpen ? '#27ae60' : '#e74c3c', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginLeft: '16px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: kitchenOpen ? '#27ae60' : '#e74c3c', display: 'inline-block' }}></span>
                        {kitchenOpen ? 'Kitchen Open' : 'Kitchen Closed'}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div ref={notifRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setNotifOpen(!notifOpen)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: 'var(--text-main)' }}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--error)', color: '#fff', fontSize: '0.6rem', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {notifOpen && (
                            <div className="subadmin-dropdown-menu" style={{ right: '-60px', left: 'auto', width: '320px', top: '100%', marginTop: '16px', zIndex: 100, padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FA' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#0F3F26' }}>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
                                    )}
                                </div>
                                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications yet</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n._id} onClick={() => !n.isRead && handleMarkAsRead(n._id)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: n.isRead ? '#fff' : '#f0f9f4', cursor: n.isRead ? 'default' : 'pointer' }}>
                                                <div style={{ fontWeight: 700, color: '#0F3F26', fontSize: '0.85rem', marginBottom: '4px' }}>{n.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '4px' }}>{n.body}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div ref={userRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setUserOpen(!userOpen)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-dark)', padding: '4px 12px 4px 4px', borderRadius: '20px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        >
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--text-main)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                                {user.name?.charAt(0)}
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: window.innerWidth > 600 ? 'block' : 'none' }}>
                                {user.businessName?.split(' ')[0] || user.name?.split(' ')[0]} Kitchen
                            </span>
                            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        {userOpen && (
                            <div className="subadmin-dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '220px', top: '100%', marginTop: '8px', zIndex: 100 }}>
                                <NavLink to="/chef/profile" className="subadmin-dropdown-item" onClick={() => setUserOpen(false)}>
                                    <User size={16} /> My Profile
                                </NavLink>
                                <button className="subadmin-dropdown-item" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ─── BODY (Sidebar + Main Content) ─── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ─── SIDEBAR (Desktop) ─── */}
                <aside className="chef-sidebar" style={{
                    width: '230px',
                    minWidth: '230px',
                    background: '#fff',
                    borderRight: '1px solid var(--border-subtle)',
                    display: window.innerWidth > 900 ? 'flex' : 'none',
                    flexDirection: 'column',
                    overflowY: 'auto'
                }}>
                    {/* Compact Profile Info */}
                    <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', margin: '0 auto 8px', overflow: 'hidden' }}>
                            {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {user.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{user.businessName || user.name}</h2>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            Home Chef • {user.city?.name || 'Hyderabad'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                            <Star fill="#f39c12" color="#f39c12" size={12} />
                            {stats?.rating ?? user.rating ?? 0} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({stats?.numReviews ?? user.numReviews ?? 0} reviews)</span>
                        </div>
                    </div>

                    {/* Navigation Groups */}
                    <nav style={{ padding: '16px 12px', flex: 1 }}>
                        {sidebarGroups.map((group, idx) => (
                            <div key={idx} style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '4px' }}>
                                    {group.title}
                                </div>
                                {group.items.map(item => (
                                    <NavLink key={item.to} to={item.to} end={item.end} style={navLinkStyle}>
                                        <item.icon size={16} style={{ color: location.pathname === item.to ? 'var(--primary)' : 'var(--text-muted)' }} />
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {item.badge && (
                                            <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        ))}
                    </nav>

                    <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-subtle)' }}>
                        <button onClick={handleLogout} style={{ ...navLinkStyle({ isActive: false }), width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)', justifyContent: 'flex-start' }}>
                            <LogOut size={16} style={{ color: 'var(--error)' }} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Mobile nav overlay */}
                {mobileMenuOpen && (
                    <div className="subadmin-mobile-nav" style={{ position: 'absolute', top: '70px', left: 0, right: 0, bottom: 0, zIndex: 30, background: 'rgba(0,0,0,0.5)' }}>
                        <div style={{ width: '250px', background: '#fff', height: '100%', padding: '16px', overflowY: 'auto' }}>
                            {sidebarGroups.map((group, idx) => (
                                <div key={idx} style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '4px' }}>
                                        {group.title}
                                    </div>
                                    {group.items.map(item => (
                                        <NavLink key={item.to} to={item.to} end={item.end} style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}>
                                            <item.icon size={16} /> {item.label}
                                        </NavLink>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── MAIN CONTENT ─── */}
                <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: window.innerWidth > 600 ? '32px' : '16px' }}>
                    <Outlet />
                </main>
            </div>

            {/* ─── MOBILE BOTTOM NAV ─── */}
            <nav className="show-on-mobile-flex" style={{
                display: 'none',
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: '#fff',
                borderTop: '1px solid var(--border-subtle)',
                padding: '8px 0 env(safe-area-inset-bottom, 12px)',
                zIndex: 1000,
                boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
                justifyContent: 'space-around'
            }}>
                {mobileBottomNav.map(item => (
                    item.action === 'more' ? (
                        <button
                            key="more"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                flex: 1,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                background: 'none', border: 'none',
                                fontSize: '0.75rem', fontWeight: 600,
                                color: mobileMenuOpen ? 'var(--primary)' : 'var(--text-muted)',
                                transition: 'color 0.2s', cursor: 'pointer'
                            }}
                        >
                            <item.icon size={22} />
                            {item.label}
                        </button>
                    ) : (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => ({
                                flex: 1,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                textDecoration: 'none',
                                fontSize: '0.75rem', fontWeight: 600,
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                transition: 'color 0.2s'
                            })}
                        >
                            <item.icon size={22} />
                            {item.label}
                        </NavLink>
                    )
                ))}
            </nav>
        </div>
    );
};

export default ChefLayout;
