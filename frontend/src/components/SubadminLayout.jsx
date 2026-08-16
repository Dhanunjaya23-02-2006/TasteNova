import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AdminSocketProvider } from '../context/AdminSocketContext';
import {
    LayoutDashboard, ShoppingBag, ChefHat, Truck, Tag,
    Users, Image, Ticket, MessageCircle, RotateCcw, BarChart3,
    Bell, ChevronDown, User, MapPin, Shield, LogOut, Menu, X
} from 'lucide-react';
import { API_URL } from '../config';

const mainNav = [
    { to: '/subadmin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/subadmin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/subadmin/chefs', label: 'Chefs', icon: ChefHat },
    { to: '/subadmin/delivery', label: 'Delivery', icon: Truck },
    { to: '/subadmin/promotions', label: 'Promotions', icon: Tag },
];

const moreNav = [
    { to: '/subadmin/customers', label: 'Customers', icon: Users },
    { to: '/subadmin/banners', label: 'Banners', icon: Image },
    { to: '/subadmin/coupons', label: 'Coupons', icon: Ticket },
    { to: '/subadmin/support', label: 'Support', icon: MessageCircle },
    { to: '/subadmin/refunds', label: 'Refunds', icon: RotateCcw },
    { to: '/subadmin/analytics', label: 'City Analytics', icon: BarChart3 },
];

const SubadminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [moreOpen, setMoreOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cityName, setCityName] = useState('');
    const moreRef = useRef(null);
    const userRef = useRef(null);

    useEffect(() => {
        if (!user || !['subadmin', 'admin', 'superadmin'].includes(user.role)) {
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch city name
    useEffect(() => {
        const fetchCity = async () => {
            if (user?.city) {
                try {
                    const res = await fetch(`${API_URL}/cities`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    if (res.ok) {
                        const cities = await res.json();
                        const myCity = cities.find(c => c._id === user.city);
                        if (myCity) setCityName(myCity.name);
                    }
                } catch (e) { /* silent */ }
            }
        };
        fetchCity();
    }, [user]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
            if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user || !['subadmin', 'admin', 'superadmin'].includes(user.role)) return null;

    const navLinkStyle = ({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500,
        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
        background: isActive ? 'var(--primary-light)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s ease'
    });

    return (
        <AdminSocketProvider>
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Top Bar */}
            <header className="subadmin-topbar">
                <div className="subadmin-topbar-left">
                    {/* Mobile hamburger */}
                    <button
                        className="subadmin-hamburger"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    <NavLink to="/subadmin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 400 }}>
                            TasteNova
                        </span>
                    </NavLink>

                    {/* City context */}
                    <div className="subadmin-city-badge">
                        <MapPin size={14} />
                        <span>{cityName || 'City'} Operations</span>
                    </div>
                </div>

                {/* Desktop nav links */}
                <nav className="subadmin-nav-desktop">
                    {mainNav.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.end} style={navLinkStyle}>
                            <item.icon size={16} />
                            {item.label}
                        </NavLink>
                    ))}

                    {/* More dropdown */}
                    <div ref={moreRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => { setMoreOpen(!moreOpen); setUserOpen(false); }}
                            className="subadmin-dropdown-trigger"
                            style={{ color: moreOpen ? 'var(--primary)' : 'var(--text-muted)' }}
                        >
                            More <ChevronDown size={14} style={{ transform: moreOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </button>
                        {moreOpen && (
                            <div className="subadmin-dropdown-menu">
                                {moreNav.map(item => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMoreOpen(false)}
                                        className="subadmin-dropdown-item"
                                    >
                                        <item.icon size={16} />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="subadmin-topbar-right">
                    {/* Notifications */}
                    <button className="subadmin-icon-btn" title="Notifications">
                        <Bell size={20} />
                    </button>

                    {/* User dropdown */}
                    <div ref={userRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => { setUserOpen(!userOpen); setMoreOpen(false); }}
                            className="subadmin-user-trigger"
                        >
                            <div className="subadmin-avatar">
                                {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="subadmin-user-name">{user.name?.split(' ')[0]}</span>
                            <ChevronDown size={14} style={{ transform: userOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </button>
                        {userOpen && (
                            <div className="subadmin-dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '220px' }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>City Sub-Admin</div>
                                </div>
                                <NavLink to="/subadmin/profile" className="subadmin-dropdown-item" onClick={() => setUserOpen(false)}>
                                    <User size={16} /> My Profile
                                </NavLink>
                                <NavLink to="/subadmin/assigned-zones" className="subadmin-dropdown-item" onClick={() => setUserOpen(false)}>
                                    <MapPin size={16} /> Assigned Zones
                                </NavLink>
                                <NavLink to="/subadmin/permissions" className="subadmin-dropdown-item" onClick={() => setUserOpen(false)}>
                                    <Shield size={16} /> Permissions
                                </NavLink>
                                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />
                                <button className="subadmin-dropdown-item" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile nav overlay */}
            {mobileOpen && (
                <div className="subadmin-mobile-nav">
                    <div className="subadmin-mobile-nav-section">
                        {mainNav.map(item => (
                            <NavLink key={item.to} to={item.to} end={item.end} style={navLinkStyle} onClick={() => setMobileOpen(false)}>
                                <item.icon size={18} /> {item.label}
                            </NavLink>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />
                    <div className="subadmin-mobile-nav-section">
                        {moreNav.map(item => (
                            <NavLink key={item.to} to={item.to} style={navLinkStyle} onClick={() => setMobileOpen(false)}>
                                <item.icon size={18} /> {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            {/* Main content */}
            <main className="subadmin-content">
                <Outlet />
            </main>
        </div>
        </AdminSocketProvider>
    );
};

export default SubadminLayout;
