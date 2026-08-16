import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, Wallet,
    Bell, ChevronDown, User, Settings, LogOut, Menu, X, HelpCircle,
    Home as HomeIcon, MoreHorizontal, Star, FileText, Gift, Box
} from 'lucide-react';
import { API_URL } from '../config';

const sidebarGroups = [
    {
        title: 'MAIN',
        items: [
            { to: '/delivery/dashboard', label: 'Dashboard', icon: HomeIcon, end: true },
            { to: '/delivery/orders', label: 'Deliveries', icon: Box },
            { to: '/delivery/earnings', label: 'Earnings', icon: Wallet },
            { to: '/delivery/incentives', label: 'Incentives', icon: Gift },
        ]
    },
    {
        title: 'ACCOUNT',
        items: [
            { to: '/delivery/notifications', label: 'Notifications', icon: Bell },
            { to: '/delivery/profile', label: 'Profile', icon: User },
            { to: '/delivery/documents', label: 'Documents', icon: FileText },
            { to: '/delivery/support', label: 'Help & Support', icon: HelpCircle },
        ]
    }
];

const mobileBottomNav = [
    { to: '/delivery/dashboard', label: 'Home', icon: HomeIcon },
    { to: '/delivery/orders', label: 'Deliveries', icon: Box },
    { to: '/delivery/earnings', label: 'Earnings', icon: Wallet },
    { to: '/delivery/notifications', label: 'Alerts', icon: Bell },
    { to: '/delivery/profile', label: 'Profile', icon: User },
];

const DeliveryLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const userRef = useRef(null);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'delivery') {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const handler = (e) => {
            if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user || user.role !== 'delivery') return null;

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
                    <button
                        className="subadmin-hamburger"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ display: window.innerWidth > 900 ? 'none' : 'block', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>T</div>
                        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: 'var(--text-main)' }}>TasteNova</span>
                    </div>

                    <div style={{ display: window.innerWidth > 600 ? 'flex' : 'none', alignItems: 'center', gap: '6px', background: isOnline ? 'rgba(39, 174, 96, 0.1)' : 'rgba(100, 100, 100, 0.1)', color: isOnline ? '#27ae60' : '#666', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginLeft: '16px', cursor: 'pointer' }} onClick={() => setIsOnline(!isOnline)}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#27ae60' : '#666', display: 'inline-block' }}></span>
                        {isOnline ? 'You are Online' : 'You are Offline'}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                        <HelpCircle size={18} />
                        <span style={{ display: window.innerWidth > 600 ? 'block' : 'none' }}>Help & Support</span>
                    </button>

                    <div ref={userRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setUserOpen(!userOpen)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-dark)', padding: '4px 12px 4px 4px', borderRadius: '20px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                        >
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, overflow: 'hidden' }}>
                                {user.profilePic ? <img src={user.profilePic} style={{width: '100%', height:'100%', objectFit: 'cover'}} /> : user.name?.charAt(0)}
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: window.innerWidth > 600 ? 'block' : 'none' }}>
                                {user.name?.split(' ')[0]}
                            </span>
                            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        {userOpen && (
                            <div className="subadmin-dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '220px', top: '100%', marginTop: '8px', zIndex: 100 }}>
                                <NavLink to="/delivery/profile" className="subadmin-dropdown-item" onClick={() => setUserOpen(false)}>
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
                <aside className="delivery-sidebar" style={{
                    width: '230px',
                    minWidth: '230px',
                    background: '#fff',
                    borderRight: '1px solid var(--border-subtle)',
                    display: window.innerWidth > 900 ? 'flex' : 'none',
                    flexDirection: 'column',
                    overflowY: 'auto'
                }}>
                    <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <button onClick={() => setIsOnline(!isOnline)} style={{
                            width: '100%',
                            padding: '12px',
                            background: isOnline ? '#fff' : 'var(--error)',
                            border: isOnline ? '1px solid var(--error)' : 'none',
                            color: isOnline ? 'var(--error)' : '#fff',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </button>
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
                <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: window.innerWidth > 600 ? '32px' : '16px', paddingBottom: window.innerWidth > 900 ? '32px' : '80px' }}>
                    <Outlet />
                </main>
            </div>

            {/* ─── MOBILE BOTTOM NAV ─── */}
            <nav style={{
                display: window.innerWidth > 900 ? 'none' : 'flex',
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: '#fff',
                borderTop: '1px solid var(--border-subtle)',
                padding: '8px 0 env(safe-area-inset-bottom, 12px)',
                zIndex: 1000,
                boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
            }}>
                {mobileBottomNav.map(item => (
                    <NavLink 
                        key={item.to} 
                        to={item.to} 
                        style={({ isActive }) => ({
                            flex: 1,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            textDecoration: 'none',
                            fontSize: '0.7rem', fontWeight: 600,
                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                            transition: 'color 0.2s'
                        })}
                    >
                        <item.icon size={22} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default DeliveryLayout;
