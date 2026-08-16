import React, { useContext, useState, useEffect, Suspense, lazy } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useLocation, useParams, Link, Navigate } from 'react-router-dom';
import { 
    User, ListOrdered, Repeat, CalendarCheck, Map, 
    CreditCard, Heart, Star, Wallet, Bell, HelpCircle, 
    Settings, LogOut, Edit3, ChevronRight 
} from 'lucide-react';

const ProfileOverviewTab = lazy(() => import('../../components/account/ProfileOverviewTab'));
const OrdersTab = lazy(() => import('../../components/account/OrdersTab'));
const SubscriptionsTab = lazy(() => import('../../components/account/SubscriptionsTab'));
const WalletTab = lazy(() => import('../../components/account/WalletTab'));
const FavouritesTab = lazy(() => import('../../components/account/FavouritesTab'));
const ReviewsTab = lazy(() => import('../../components/account/ReviewsTab'));
const AddressesTab = lazy(() => import('../../components/account/AddressesTab'));
const NotificationsTab = lazy(() => import('../../components/account/NotificationsTab'));
const SettingsTab = lazy(() => import('../../components/account/SettingsTab'));
const BookingsTab = lazy(() => import('../../components/account/BookingsTab'));
const PaymentsTab = lazy(() => import('../../components/account/PaymentsTab'));
const SupportTab = lazy(() => import('../../components/account/SupportTab'));

const MyAccount = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const { tab } = useParams();
    const activeTab = tab || 'overview';

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const sidebarLinks = [
        { id: 'overview', label: 'Profile Overview', icon: User },
        { id: 'orders', label: 'Order History', icon: ListOrdered },
        { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
        { id: 'bookings', label: 'Party Bookings', icon: CalendarCheck },
        { id: 'addresses', label: 'Addresses', icon: Map },
        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
        { id: 'favourites', label: 'Favorites', icon: Heart },
        { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
        { id: 'wallet', label: 'Wallet & Transactions', icon: Wallet },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'support', label: 'Help & Support', icon: HelpCircle },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <ProfileOverviewTab />;
            case 'orders':
                return <OrdersTab />;
            case 'subscriptions':
                return <SubscriptionsTab />;
            case 'wallet':
                return <WalletTab />;
            case 'favourites':
                return <FavouritesTab />;
            case 'reviews':
                return <ReviewsTab />;
            case 'bookings':
                return <BookingsTab />;
            case 'addresses':
                return <AddressesTab />;
            case 'payments':
                return <PaymentsTab />;
            case 'notifications':
                return <NotificationsTab />;
            case 'support':
                return <SupportTab />;
            case 'settings':
                return <SettingsTab />;
            default:
                return <ProfileOverviewTab />;
        }
    };

    return (
        <div className="container" style={{ animation: 'fadeInUp 0.6s ease', maxWidth: '1200px', paddingTop: '24px', paddingBottom: '80px' }}>
            {/* Mobile Tab Nav */}
            <div className="account-mobile-tabs" style={{ display: 'none', overflowX: 'auto', gap: '8px', marginBottom: '20px', paddingBottom: '4px' }}>
                {sidebarLinks.map(link => (
                    <Link
                        key={link.id}
                        to={`/account/${link.id}`}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            background: activeTab === link.id ? 'var(--primary)' : 'var(--bg-surface)',
                            color: activeTab === link.id ? '#fff' : 'var(--text-muted)',
                            border: activeTab === link.id ? 'none' : '1px solid var(--border-subtle)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            textDecoration: 'none',
                            flexShrink: 0
                        }}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                
                {/* LEFT SIDEBAR (desktop only) */}
                <div className="account-sidebar" style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
                    
                    {/* User Profile Card */}
                    <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ position: 'relative', marginBottom: '15px' }}>
                            {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 8px 16px rgba(252, 128, 25, 0.2)' }} />
                            ) : (
                                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 'bold', boxShadow: '0 8px 16px rgba(252, 128, 25, 0.2)' }}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '4px', fontWeight: 'bold' }}>{user.name || 'User'}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>{user.email || ''}</p>
                        
                        <Link to="/account/settings" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textDecoration: 'none' }}>
                            <Edit3 size={14} /> Edit Profile
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '16px 0', boxShadow: 'var(--shadow-card)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {sidebarLinks.map((link) => {
                                const isActive = activeTab === link.id;
                                return (
                                    <Link 
                                        key={link.id} 
                                        to={`/account/${link.id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 24px',
                                            color: isActive ? 'var(--primary)' : 'var(--text-main)',
                                            background: isActive ? 'rgba(23, 107, 69, 0.06)' : 'transparent',
                                            textDecoration: 'none',
                                            fontWeight: isActive ? 600 : 500,
                                            borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                        className="profile-nav-link"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <link.icon size={18} />
                                            {link.label}
                                        </div>
                                    </Link>
                                );
                            })}
                            
                            <div style={{ margin: '12px 24px', borderTop: '1px solid var(--border-subtle)' }}></div>
                            
                            <button 
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 24px',
                                    color: '#ff4757',
                                    background: 'transparent',
                                    border: 'none',
                                    borderLeft: '4px solid transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    width: '100%',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Suspense fallback={<div className="animate-fade-up" style={{ padding: '40px', background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-card)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
                        {renderTabContent()}
                    </Suspense>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .account-sidebar { display: none !important; }
                    .account-mobile-tabs { display: flex !important; }
                }
            `}</style>
        </div>
    );
};

export default MyAccount;
