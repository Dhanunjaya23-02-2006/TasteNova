import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
    ShoppingBag, Repeat, Heart, Wallet, 
    ArrowRight, MapPin, CreditCard, Gift, MoreVertical, CheckCircle, XCircle, ChevronRight,
    Settings, LogOut, Bell, HelpCircle, Map
} from 'lucide-react';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const ProfileOverviewTab = () => {
    const { user, logout } = useContext(AuthContext);

    const [orders, setOrders] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!user || !user.token) return;
                
                // Fetch Orders
                const ordersRes = await fetch(`${API_URL}/orders/myorders`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const ordersData = ordersRes.ok ? await ordersRes.json() : [];
                setOrders(ordersData || []);

                // Fetch Subscriptions
                const subsRes = await fetch(`${API_URL}/subscriptions/my`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const subsData = subsRes.ok ? await subsRes.json() : [];
                setSubscriptions(subsData || []);

                // Fetch Wallet
                const walletRes = await fetch(`${API_URL}/earnings/wallet`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (walletRes.ok) {
                    const walletData = await walletRes.json();
                    setWalletBalance(walletData.balance || 0);
                }

                // Fetch Profile for Payment Methods
                const profileRes = await fetch(`${API_URL}/users/profile`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setPaymentMethods(profileData.paymentMethods || []);
                }
                
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const handleInvite = async () => {
        const inviteText = "Join me on TasteNova and get ₹100 off your first order! 🍔";
        const inviteUrl = window.location.origin;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'TasteNova Invite',
                    text: inviteText,
                    url: inviteUrl
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${inviteText} ${inviteUrl}`);
                toast.success('Invite link copied to clipboard!');
            } catch (err) {
                toast.error('Failed to copy link.');
            }
        }
    };

    const totalSpent = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const activeSubsCount = subscriptions.filter(s => s.status === 'active' || s.status === 'Active').length;
    const favoriteCount = user?.following?.length || 0;

    const statCards = [
        { title: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'var(--primary)', link: '/account/orders', linkText: 'View all orders' },
        { title: 'Active Subscription', value: activeSubsCount.toString(), icon: Repeat, color: '#2ed573', link: '/account/subscriptions', linkText: 'View subscriptions' },
        { title: 'Favorite Kitchens', value: favoriteCount.toString(), icon: Heart, color: '#ff4757', link: '/account/favourites', linkText: 'View favorites' },
        { title: 'Total Spent', value: `₹${totalSpent.toFixed(2)}`, icon: Wallet, color: '#1e90ff', link: '/account/wallet', linkText: 'View details' }
    ];

    const recentOrders = orders.slice(0, 3).map(order => ({
        id: order._id,
        item: order.orderItems && order.orderItems.length > 0 ? order.orderItems[0].name + (order.orderItems.length > 1 ? ` +${order.orderItems.length - 1} more` : '') : 'Order',
        kitchen: order.chef?.kitchenName || order.chef?.name || 'Local Kitchen',
        date: new Date(order.createdAt).toLocaleDateString() + ' • ' + new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: order.orderStatus,
        price: `₹${order.totalPrice}`,
        image: order.orderItems && order.orderItems[0]?.image ? order.orderItems[0].image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&q=80'
    }));

    const activeSubscriptionsList = subscriptions.slice(0, 2).map(sub => ({
        id: sub._id,
        name: sub.plan?.name || 'Meal Plan',
        kitchen: sub.chef?.kitchenName || 'Kitchen',
        schedule: `${sub.plan?.frequency || 'Daily'}`,
        nextDelivery: 'Check details',
        status: sub.status,
        image: sub.plan?.image || 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=150&q=80'
    }));

    const savedAddresses = user?.addresses || [];

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><div className="spinner"></div></div>;
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header & Wallet Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Welcome back, {user?.name?.split(' ')[0]}! <span style={{ fontSize: '1.5rem' }}>👋</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your orders, subscriptions & profile all in one place.</p>
                </div>
                
                <div style={{ background: 'var(--bg-surface)', padding: '16px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(46, 213, 115, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#2ed573' }}>
                            <Wallet size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>TasteNova Cash</p>
                            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '800' }}>₹{walletBalance.toFixed(2)}</h3>
                        </div>
                    </div>
                    <Link to="/account/wallet" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#2ed573', borderColor: 'rgba(46, 213, 115, 0.3)', background: 'rgba(46, 213, 115, 0.05)' }}>
                        Top Up Wallet
                    </Link>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {statCards.map((stat, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ color: stat.color }}>
                                <stat.icon size={22} />
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.title}</span>
                        </div>
                        <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: '800' }}>{stat.value}</h3>
                        <Link to={stat.link} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, marginTop: 'auto' }}>
                            {stat.linkText} <ArrowRight size={14} />
                        </Link>
                    </div>
                ))}
            </div>

            {/* Two Column Grid for Lists */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                
                {/* Recent Orders */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Recent Orders</h3>
                        <Link to="/account/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentOrders.length > 0 ? recentOrders.map(order => (
                            <div key={order.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                                <img src={order.image} alt={order.item} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>{order.item}</h4>
                                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, 
                                            background: (order.status === 'Delivered' || order.status === 'Completed') ? 'rgba(46, 213, 115, 0.1)' : order.status === 'Cancelled' ? 'rgba(255, 71, 87, 0.1)' : 'rgba(255, 165, 2, 0.1)',
                                            color: (order.status === 'Delivered' || order.status === 'Completed') ? '#2ed573' : order.status === 'Cancelled' ? '#ff4757' : '#ffa502'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{order.kitchen}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.date}</p>
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{order.price}</div>
                                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                                No recent orders found.
                            </div>
                        )}
                    </div>
                    {recentOrders.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Link to="/account/orders" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                Start Ordering Now <ChevronRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Subscriptions */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Your Subscriptions</h3>
                        <Link to="/account/subscriptions" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {activeSubscriptionsList.length > 0 ? activeSubscriptionsList.map(sub => (
                            <div key={sub.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                                <img src={sub.image} alt={sub.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>{sub.name}</h4>
                                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, background: sub.status === 'Active' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 165, 2, 0.1)', color: sub.status === 'Active' ? '#2ed573' : '#ffa502' }}>
                                            {sub.status}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{sub.kitchen}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{sub.schedule}</p>
                                </div>
                            </div>
                        )) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                                No active subscriptions.
                            </div>
                        )}
                    </div>
                    
                    {/* Invite Friends Banner */}
                    <div style={{ marginTop: '20px', background: 'linear-gradient(135deg, rgba(252, 128, 25, 0.1), rgba(252, 128, 25, 0.05))', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(252, 128, 25, 0.2)' }}>
                        <div>
                            <h4 style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Invite friends, earn rewards!
                            </h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>They get ₹100 off & you earn ₹50</p>
                            <button onClick={handleInvite} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: '6px' }}>Invite Now</button>
                        </div>
                        <Gift size={48} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                    </div>
                </div>
            </div>

            {/* Bottom Row Grids */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                
                {/* Saved Addresses */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Saved Addresses</h3>
                        <Link to="/account/addresses" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Manage Addresses <ArrowRight size={14} />
                        </Link>
                    </div>
                    
                    {savedAddresses.length > 0 ? savedAddresses.slice(0, 1).map((addr, i) => (
                        <div key={i} style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '16px', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h4 style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{addr.label || 'Home'}</h4>
                                    {addr.isDefault && <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-muted)' }}>Default</span>}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>
                                    {addr.street}, {addr.city}, {addr.state} – {addr.zipCode}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone: {addr.phone || 'N/A'}</p>
                            </div>
                        </div>
                    )) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '10px 0' }}>
                            No saved addresses yet.
                        </div>
                    )}
                    
                    <button style={{ marginTop: '16px', color: 'var(--primary)', background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        + Add New Address
                    </button>
                </div>

                {/* Payment Methods */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Payment Methods</h3>
                        <Link to="/account/payments" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Manage <ArrowRight size={14} />
                        </Link>
                    </div>
                    
                    {paymentMethods.length > 0 ? paymentMethods.slice(0, 1).map(card => (
                        <div key={card._id} style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '50px', height: '32px', background: card.cardType === 'MASTERCARD' ? '#e74c3c' : '#2c3e50', color: '#fff', borderRadius: '4px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '10px', fontStyle: 'italic', letterSpacing: '1px' }}>
                                    {card.cardType}
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{card.cardName}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>•••• {card.cardNumber}</span>
                                        {card.isDefault && <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573', borderRadius: '4px' }}>Default</span>}
                                    </div>
                                </div>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    )) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '10px 0' }}>
                            No saved payment methods.
                        </div>
                    )}
                    
                    <Link to="/account/payments" style={{ display: 'inline-block', marginTop: '20px', color: 'var(--primary)', background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                        + Add New Payment Method
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverviewTab;
