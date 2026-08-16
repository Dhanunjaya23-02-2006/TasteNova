import React, { useState, useEffect, useContext, useMemo, Suspense, lazy } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
    ShoppingBag, 
    Calendar, 
    TrendingUp, 
    ChefHat,
    Settings,
    PackagePlus,
    Users
} from 'lucide-react';
import { API_URL } from '../../config';
import io from 'socket.io-client';

const ChefSettings = lazy(() => import('../../components/ChefSettings'));
const ChefPlans = lazy(() => import('../../components/ChefPlans'));
const ChefGrowth = lazy(() => import('../../components/ChefGrowth'));
const ChefCommunity = lazy(() => import('../../components/ChefCommunity'));
const MenuTab = lazy(() => import('../../components/chef/MenuTab'));
const OrdersTab = lazy(() => import('../../components/chef/OrdersTab'));
const BookingsTab = lazy(() => import('../../components/chef/BookingsTab'));

const ChefDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [orderFilter, setOrderFilter] = useState('Instant'); // 'Instant' or 'Scheduled'

    // Orders Data
    const [orders, setOrders] = useState([]);

    // Bookings Data
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (!user || (user.role !== 'chef' && user.role !== 'admin')) {
            navigate('/');
        } else {
            if (activeTab === 'orders' || activeTab === 'growth' || activeTab === 'bookings') {
                fetchOrders();
                fetchBookings();
            }
        }
    }, [user, activeTab, navigate]);

    useEffect(() => {
        if (user && (user.role === 'chef' || user.role === 'admin')) {
            const socket = io(API_URL.replace('/api', ''));
            
            socket.emit('join_chef', user._id);
            
            socket.on('new_order_alert', (order) => {
                toast.success('NEW ORDER! You have 90 seconds to accept!', { duration: 15000, icon: '🔔', style: { border: '2px solid #fc8019', padding: '16px', color: '#fc8019', fontWeight: 'bold' } });
                try {
                    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3');
                    audio.play();
                } catch(e) {}
                fetchOrders();
            });

            socket.on('order_expired', (orderId) => {
                toast.error('An order has expired and was automatically cancelled.', { duration: 8000 });
                fetchOrders();
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    // Data Fetching
    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setOrders(await res.json());
        } catch (error) { console.error('Error fetching orders', error); }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/chefBookings`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setBookings(await res.json());
        } catch (error) { console.error('Error fetching bookings', error); }
    };

    const handleUpdateOrder = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast.success('Order status updated');
                fetchOrders();
            }
        } catch (error) { console.error('Error updating order', error); }
    };

    const handleUpdateBooking = async (id, status) => {
        const action = status === 'Confirmed' ? 'accept' : 'reject';
        try {
            const res = await fetch(`${API_URL}/chefBookings/${id}/${action}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) fetchBookings();
        } catch (error) { console.error('Error updating booking', error); }
    };

    // Derived Stats
    const stats = useMemo(() => {
        const totalEarnings = orders.reduce((sum, order) => sum + (order.status === 'Ready' || order.status === 'Delivered' ? order.totalPrice : 0), 0);
        const activeOrders = orders.filter(o => ['Placed', 'Accepted', 'Preparing'].includes(o.status)).length;
        const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
        return { totalEarnings, activeOrders, pendingBookings };
    }, [orders, bookings]);

    if (!user) {
        return (
            <div className="container mt-4 text-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ChefHat size={48} className="mb-3" style={{ color: 'var(--primary-color)' }} />
                    <p>Loading your kitchen...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mt-4" style={{ animation: 'fadeInUp 0.6s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--primary)', fontWeight: '800' }}>{user.businessName || 'My Kitchen'} <span style={{ fontSize: '1rem', background: 'var(--success)', color: '#fff', padding: '4px 10px', borderRadius: '15px', verticalAlign: 'middle' }}>Active</span></h2>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <motion.div whileHover={{ y: -5 }} className="stat-card glass-panel" style={{ borderLeftColor: 'var(--primary-color)', boxShadow: 'var(--shadow-floating)' }}>
                    <div className="stat-label">Total Earnings</div>
                    <div className="stat-value">₹{stats.totalEarnings}</div>
                    <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.8rem' }}>
                        <TrendingUp size={14} /> +12% this week
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="stat-card glass-panel" style={{ borderLeftColor: 'var(--secondary-color)', boxShadow: 'var(--shadow-floating)' }}>
                    <div className="stat-label">Active Orders</div>
                    <div className="stat-value">{stats.activeOrders}</div>
                    <div className="status-badge status-pending">
                        <span className="pulse-dot"></span> Needs attention
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="stat-card glass-panel" style={{ borderLeftColor: '#3498db', boxShadow: 'var(--shadow-floating)' }}>
                    <div className="stat-label">Pending Bookings</div>
                    <div className="stat-value">{stats.pendingBookings}</div>
                    <div className="status-badge status-info">New requests</div>
                </motion.div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px', justifyContent: 'center', background: 'var(--bg-body)', padding: '10px', borderRadius: '15px', maxWidth: '800px', margin: '0 auto 40px' }}>
                {[
                    { id: 'orders', label: 'Orders', icon: ShoppingBag },
                    { id: 'bookings', label: 'Party Bookings', icon: Calendar },
                    { id: 'menu', label: 'Menu', icon: ChefHat },
                    { id: 'growth', label: 'Growth', icon: TrendingUp },
                    { id: 'community', label: 'Community', icon: Users },
                    { id: 'plans', label: 'Plans', icon: PackagePlus },
                    { id: 'settings', label: 'Settings', icon: Settings }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`} 
                        onClick={() => setActiveTab(tab.id)} 
                        style={{ padding: '10px 20px', flex: '1 1 auto', fontSize: '0.9rem', textTransform: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <Suspense fallback={<p className="text-center mt-4">Loading section...</p>}>
                {activeTab === 'orders' && (
                    <OrdersTab 
                        orders={orders} 
                        orderFilter={orderFilter} 
                        setOrderFilter={setOrderFilter} 
                        fetchOrders={fetchOrders} 
                        handleUpdateOrder={handleUpdateOrder} 
                    />
                )}
                {activeTab === 'bookings' && (
                    <BookingsTab 
                        bookings={bookings} 
                        handleUpdateBooking={handleUpdateBooking} 
                    />
                )}
                {activeTab === 'menu' && <MenuTab />}
                {activeTab === 'growth' && <ChefGrowth />}
                {activeTab === 'community' && <ChefCommunity />}
                {activeTab === 'plans' && <ChefPlans />}
                {activeTab === 'settings' && <ChefSettings />}
            </Suspense>
        </div>
    );
};

export default ChefDashboard;
