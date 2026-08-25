import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SuperadminSocketProvider } from '../context/SuperadminSocketContext';
import {
    LayoutDashboard, Map, Settings, FileText, ShoppingBag,
    ChefHat, Truck, Users, MessageCircle, ShieldCheck,
    CheckSquare, IndianRupee, Wallet, CreditCard, RotateCcw,
    Receipt, Tag, Ticket, Image, Megaphone, Star,
    BarChart3, PieChart, Activity, Grip, Lock, ChevronDown, ChevronRight, User, LogOut, Menu, X
} from 'lucide-react';

const navSections = [
    {
        title: 'PLATFORM',
        items: [
            { to: '/superadmin', label: 'Dashboard', icon: LayoutDashboard, end: true },
            { to: '/superadmin/cities', label: 'Cities & Zones', icon: Map },
            { to: '/superadmin/settings', label: 'Settings', icon: Settings },
            { to: '/superadmin/audit-logs', label: 'Audit Logs', icon: FileText },
        ]
    },
    {
        title: 'OPERATIONS',
        items: [
            { to: '/superadmin/orders', label: 'Orders', icon: ShoppingBag },
            { to: '/superadmin/chefs', label: 'Chefs', icon: ChefHat },
            { to: '/superadmin/delivery', label: 'Delivery', icon: Truck },
            { to: '/superadmin/customers', label: 'Customers', icon: Users },
            { to: '/superadmin/support', label: 'Support', icon: MessageCircle },
        ]
    },
    {
        title: 'ADMINISTRATION',
        items: [
            { to: '/superadmin/subadmins', label: 'Sub-Admins', icon: ShieldCheck },
            { to: '/superadmin/verification', label: 'Verification', icon: CheckSquare },
        ]
    },
    {
        title: 'FINANCE',
        items: [
            { to: '/superadmin/revenue', label: 'Revenue', icon: IndianRupee },
            { to: '/superadmin/commissions', label: 'Commissions', icon: PieChart },
            { to: '/superadmin/wallets', label: 'Wallets', icon: Wallet },
            { to: '/superadmin/payouts', label: 'Payouts', icon: CreditCard },
            { to: '/superadmin/refunds', label: 'Refunds', icon: RotateCcw },
            { to: '/superadmin/taxes', label: 'Taxes', icon: Receipt },
        ]
    },
    {
        title: 'MARKETING',
        items: [
            { to: '/superadmin/promotions', label: 'Promotions', icon: Tag },
            { to: '/superadmin/coupons', label: 'Coupons', icon: Ticket },
            { to: '/superadmin/banners', label: 'Banners', icon: Image },
            { to: '/superadmin/campaigns', label: 'Campaigns', icon: Megaphone },
            { to: '/superadmin/featured', label: 'Featured Chefs', icon: Star },
        ]
    },
    {
        title: 'ANALYTICS',
        items: [
            { to: '/superadmin/analytics/business', label: 'Business', icon: BarChart3 },
            { to: '/superadmin/analytics/city', label: 'City', icon: Map },
        ]
    },
    {
        title: 'CONTENT',
        items: [
            { to: '/superadmin/categories', label: 'Categories', icon: Grip },
            { to: '/superadmin/pages', label: 'Pages', icon: FileText },
        ]
    },
    {
        title: 'SYSTEM',
        items: [
            { to: '/superadmin/system-health', label: 'System Health', icon: Activity },
        ]
    }
];

// Build breadcrumb from current path
const getBreadcrumb = (pathname) => {
    const segments = pathname.replace('/superadmin', '').split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Dashboard' }];
    
    // Find matching nav item
    for (const section of navSections) {
        for (const item of section.items) {
            if (pathname === item.to || pathname.startsWith(item.to + '/')) {
                return [{ label: section.title, muted: true }, { label: item.label }];
            }
        }
    }
    
    return segments.map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ') }));
};

const SuperadminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [userOpen, setUserOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const userRef = useRef(null);

    useEffect(() => {
        if (!user || user.role !== 'superadmin') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const handler = (e) => {
            if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    if (!user || user.role !== 'superadmin') return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const breadcrumbs = getBreadcrumb(location.pathname);

    const SidebarContent = () => (
        <>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, background: 'var(--primary)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: 'var(--accent)' }}>TasteNova</h1>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>Super Admin</div>
                </div>
                {/* Close button (mobile only) */}
                <button
                    className="sup-sidebar-close"
                    onClick={() => setSidebarOpen(false)}
                    style={{ display: 'none', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}
                >
                    <X size={22} />
                </button>
            </div>

            <div style={{ padding: '16px 12px' }}>
                {navSections.map((section, idx) => (
                    <div key={idx} style={{ marginBottom: '24px' }}>
                        <div style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            opacity: 0.5, 
                            marginBottom: '10px', 
                            paddingLeft: '12px',
                            letterSpacing: '0.05em'
                        }}>
                            {section.title}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {section.items.map((item, iIdx) => (
                                <NavLink
                                    key={iIdx}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) => `sup-nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <item.icon size={16} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.75rem', opacity: 0.5 }}>
                TasteNova Admin • v1.0.0
            </div>
        </>
    );

    return (
        <SuperadminSocketProvider>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-dark)' }}>
            
            {/* Desktop Sidebar */}
            <aside className="sup-sidebar sup-sidebar-desktop" style={{
                width: '260px',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                flexShrink: 0
            }}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="sup-sidebar-overlay"
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 999,
                        animation: 'modalFadeIn 0.2s ease'
                    }}
                    onClick={() => setSidebarOpen(false)}
                >
                    <aside
                        style={{
                            width: '280px', height: '100%', background: 'var(--primary)',
                            color: '#fff', display: 'flex', flexDirection: 'column',
                            overflowY: 'auto', animation: 'slideInLeft 0.25s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Topbar */}
                <header style={{
                    height: '64px',
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    boxShadow: 'var(--shadow-card)',
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Hamburger (mobile only) */}
                        <button
                            className="sup-hamburger"
                            onClick={() => setSidebarOpen(true)}
                            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '4px' }}
                        >
                            <Menu size={24} />
                        </button>
                        
                        {/* Breadcrumb */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    {idx > 0 && <ChevronRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />}
                                    <span style={{
                                        fontWeight: crumb.muted ? 500 : 600,
                                        color: crumb.muted ? 'var(--text-muted)' : 'var(--text-main)',
                                        fontSize: crumb.muted ? '0.8rem' : '1.05rem',
                                        textTransform: crumb.muted ? 'uppercase' : 'none',
                                        letterSpacing: crumb.muted ? '0.03em' : 'normal'
                                    }}>
                                        {crumb.label}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="subadmin-icon-btn" onClick={() => navigate('/superadmin/system-health')} title="System Health"><Activity size={20} /></button>
                        
                        <div ref={userRef} style={{ position: 'relative' }}>
                            <div className="sup-user-dropdown" onClick={() => setUserOpen(!userOpen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 12px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {user.name?.charAt(0)}
                                </div>
                                <span className="sup-user-name" style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user.name?.split(' ')[0]}</span>
                                <ChevronDown size={14} style={{ transform: userOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                            </div>

                            {userOpen && (
                                <div className="subadmin-dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '220px', position: 'absolute', top: '100%', marginTop: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-floating)', zIndex: 100, overflow: 'hidden' }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Super Admin</div>
                                    </div>
                                    <NavLink to="/superadmin/settings" className="subadmin-dropdown-item" onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', color: 'var(--text-main)', textDecoration: 'none' }}>
                                        <Settings size={16} /> Platform Settings
                                    </NavLink>
                                    <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />
                                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', width: '100%', textAlign: 'left', border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Outlet */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        <Outlet />
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                @media (max-width: 900px) {
                    .sup-sidebar-desktop { display: none !important; }
                    .sup-hamburger { display: flex !important; }
                    .sup-sidebar-close { display: flex !important; }
                    .sup-user-name { display: none; }
                }
            `}</style>
        </div>
        </SuperadminSocketProvider>
    );
};

export default SuperadminLayout;
