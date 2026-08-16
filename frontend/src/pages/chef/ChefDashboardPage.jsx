import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    TrendingUp, ShoppingBag, ChefHat, Star, Users, Wallet,
    Calendar, ArrowRight, Clock, CheckCircle2, Package, Megaphone, Plus, FileText, ChevronDown, Gift, ShieldCheck, Ticket, BarChart3
} from 'lucide-react';
import io from 'socket.io-client';

// CSS classes as styles
const cardBase = {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
};

const ChefDashboardPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [stats, setStats] = useState({
        todayEarnings: 0, todayOrders: 0, activeOrders: 0,
        pendingBookings: 0, totalEarnings: 0, upcomingScheduled: 0,
        walletBalance: 0, rating: 0, totalCustomers: 0,
        activeDishes: 0, inactiveDishes: 0,
        recentReviews: [], upcomingBookingsList: [],
        orderCompletionRate: 100, onTimeDelivery: 92, feedbackScore: 0,
        ordersCompletedToday: 0, newCustomersToday: 0, repeatCustomersToday: 0
    });

    useEffect(() => {
        fetchOrders();
        fetchStats();
        fetchStatus();
    }, []);

    useEffect(() => {
        if (user) {
            const socket = io(API_URL.replace('/api', ''));
            socket.emit('join_chef', user._id);
            socket.on('new_order_alert', () => {
                toast.success('NEW ORDER!', { duration: 10000, icon: '🔔' });
                fetchOrders();
                fetchStats();
            });
            return () => socket.disconnect();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${user?.token}` } });
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error(e); }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/chef/stats`, { headers: { Authorization: `Bearer ${user?.token}` } });
            if (res.ok) {
                const data = await res.json();
                setStats(prev => ({ ...prev, ...data }));
            }
        } catch (e) { console.error(e); }
    };

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.isOpen !== undefined) {
                    setIsOpen(data.isOpen);
                    
                    // Prompt chef to open kitchen if it's closed (only once per session)
                    if (data.isOpen === false && !sessionStorage.getItem('kitchenPromptShown')) {
                        sessionStorage.setItem('kitchenPromptShown', 'true');
                        toast((t) => (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontWeight: 600 }}>Your kitchen is currently closed.</span>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                    <button 
                                        onClick={() => {
                                            toast.dismiss(t.id);
                                            handleStatusSelect(true);
                                        }} 
                                        style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Open Kitchen Now
                                    </button>
                                    <button 
                                        onClick={() => toast.dismiss(t.id)} 
                                        style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Later
                                    </button>
                                </div>
                            </div>
                        ), { duration: 15000, position: 'top-center', id: 'kitchen-prompt' });
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/users/chef-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ isOpen: !isOpen })
            });
            if (res.ok) {
                setIsOpen(!isOpen);
                toast.success(isOpen ? 'Kitchen closed' : 'Kitchen opened');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const handleStatusSelect = async (newStatus) => {
        setIsStatusDropdownOpen(false);
        if (newStatus === isOpen) return; // No change
        try {
            const res = await fetch(`${API_URL}/users/chef-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ isOpen: newStatus })
            });
            if (res.ok) {
                setIsOpen(newStatus);
                toast.success(newStatus ? 'Kitchen is now Open' : 'Kitchen is now Closed');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    if (!user) return null;

    if (user.status === 'pending') {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <ShieldCheck size={64} color="var(--primary)" style={{ marginBottom: '20px' }} />
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', marginBottom: '16px' }}>Application Pending</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Thank you for applying to be a TasteNova Chef Partner! Your application is currently under review by our onboarding team.
                    We will contact you shortly to complete your kitchen verification.
                </p>
                <button onClick={() => window.location.href = '/'} className="btn btn-primary" style={{ marginTop: '30px', padding: '12px 30px' }}>
                    Return to Home
                </button>
            </div>
        );
    }

    const recentOrders = orders.slice(0, 4);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const dateToday = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* ─── HEADER ─── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0', fontFamily: "'DM Serif Display', serif" }}>
                        {greeting}, {user.name?.split(' ')[0]}! 👋
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem' }}>
                        Here's what's happening in your kitchen today.
                    </p>
                </div>
                <div style={{ ...cardBase, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '300px' }}>
                    <div style={{ padding: '12px', background: 'rgba(39, 174, 96, 0.1)', borderRadius: '12px' }}>
                        <ShieldCheck size={24} color="#27ae60" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOpen ? '#27ae60' : '#e74c3c' }}></div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isOpen ? '#27ae60' : '#e74c3c' }}>{isOpen ? 'Accepting Orders' : 'Currently Closed'}</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F3F26' }}>{isOpen ? 'Kitchen Open' : 'Kitchen Closed'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{isOpen ? 'Open since 9:00 AM • Closes at 10:00 PM' : 'Will open at 9:00 AM'}</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} style={{ border: '1px solid var(--border-subtle)', background: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            Manage Status <ChevronDown size={14} />
                        </button>
                        {isStatusDropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid var(--border-subtle)', zIndex: 100, minWidth: '150px', overflow: 'hidden' }}>
                                <div onClick={() => handleStatusSelect(true)} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#0F3F26', borderBottom: '1px solid var(--border-subtle)', background: isOpen ? 'rgba(39, 174, 96, 0.05)' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27ae60' }}></div> Open Kitchen
                                </div>
                                <div onClick={() => handleStatusSelect(false)} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#e74c3c', background: !isOpen ? 'rgba(231, 76, 60, 0.05)' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e74c3c' }}></div> Close Kitchen
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── TOP STATS CARDS ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                {/* Total Earnings */}
                <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', background: 'rgba(39, 174, 96, 0.1)', borderRadius: '50%', color: '#27ae60' }}>
                            <Wallet size={16} />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Total Earnings</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F3F26', marginBottom: '16px' }}>
                        ₹{(stats.todayEarnings || 0).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <span style={{ color: '#27ae60', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp size={14} /> 18% vs last 7 days
                        </span>
                        {/* Mock chart placeholder */}
                        <svg width="60" height="20" viewBox="0 0 60 20" style={{ stroke: '#27ae60', fill: 'none', strokeWidth: 2 }}>
                            <path d="M0,20 L10,15 L20,18 L30,5 L40,10 L50,2 L60,5" />
                        </svg>
                    </div>
                </div>

                {/* Active Orders */}
                <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', background: 'rgba(155, 89, 182, 0.1)', borderRadius: '50%', color: '#9b59b6' }}>
                            <Package size={16} />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Active Orders</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F3F26', marginBottom: '16px' }}>
                        {stats.activeOrders}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{stats.activeOrders > 0 ? 3 : 0}</strong> in progress • <strong style={{ color: 'var(--text-main)' }}>{stats.activeOrders > 0 ? 5 : 0}</strong> confirmed
                        </span>
                        <Link to="/chef/orders" style={{ color: '#9b59b6', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View Orders <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Pending Bookings */}
                <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', background: 'rgba(230, 126, 34, 0.1)', borderRadius: '50%', color: '#e67e22' }}>
                            <Calendar size={16} />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Pending Bookings</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F3F26', marginBottom: '16px' }}>
                        {stats.pendingBookings}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: '#e67e22' }}>{stats.pendingBookings > 0 ? 1 : 0}</strong> today • <strong style={{ color: 'var(--text-main)' }}>{stats.pendingBookings > 0 ? 1 : 0}</strong> upcoming
                        </span>
                        <Link to="/chef/party-orders" style={{ color: '#e67e22', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View Bookings <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Total Dishes */}
                <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '50%', color: '#3498db' }}>
                            <ChefHat size={16} />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Total Dishes</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F3F26', marginBottom: '16px' }}>
                        {stats.activeDishes + stats.inactiveDishes}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{stats.activeDishes}</strong> Active • <strong style={{ color: 'var(--text-main)' }}>{stats.inactiveDishes}</strong> Inactive
                        </span>
                        <Link to="/chef/menu" style={{ color: '#3498db', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Manage Menu <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ─── QUICK ACTIONS ─── */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/chef/menu" className="btn" style={{ background: '#fff', color: '#0F3F26', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px', justifyContent: 'center' }}>
                    <ChefHat size={16} color="#27ae60" /> Add New Dish
                </Link>
                <Link to="/chef/menu" className="btn" style={{ background: '#fff', color: '#0F3F26', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px', justifyContent: 'center' }}>
                    <FileText size={16} color="#e67e22" /> Manage Menu
                </Link>
                <Link to="/chef/offers" className="btn" style={{ background: '#fff', color: '#0F3F26', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px', justifyContent: 'center', textDecoration: 'none' }}>
                    <Ticket size={16} color="#e74c3c" /> Create Offer
                </Link>
                <Link to="/chef/marketing" className="btn" style={{ background: '#fff', color: '#0F3F26', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px', justifyContent: 'center' }}>
                    <Megaphone size={16} color="#9b59b6" /> Promo Tools
                </Link>
                <Link to="/chef/growth" className="btn" style={{ background: '#fff', color: '#0F3F26', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px', justifyContent: 'center' }}>
                    <BarChart3 size={16} color="#3498db" /> View Analytics
                </Link>
                <Link to="/chef/invite" className="btn" style={{ background: '#fff', color: '#0F3F26', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px', justifyContent: 'center', textDecoration: 'none' }}>
                    <Gift size={16} color="#f39c12" /> Invite & Earn
                </Link>
            </div>

            {/* ─── MIDDLE SECTION (Orders & Overview) ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Recent Orders */}
                <div style={{ ...cardBase, gridColumn: window.innerWidth < 1000 ? 'span 2' : 'span 1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26' }}>Recent Orders</h3>
                        <Link to="/chef/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View All Orders <ArrowRight size={14} />
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>No orders yet today</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {recentOrders.map(order => {
                                const statusColor = order.status === 'Preparing' ? '#e67e22' : order.status === 'Out for Delivery' ? '#3498db' : order.status === 'Delivered' ? '#27ae60' : order.status === 'Confirmed' || order.status === 'Accepted' ? '#27ae60' : '#27ae60';
                                const statusBg = order.status === 'Preparing' ? 'rgba(230,126,34,0.1)' : order.status === 'Out for Delivery' ? 'rgba(52,152,219,0.1)' : order.status === 'Delivered' ? 'rgba(39,174,96,0.1)' : order.status === 'Confirmed' || order.status === 'Accepted' ? 'rgba(39,174,96,0.1)' : 'rgba(39,174,96,0.1)';

                                return (
                                    <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                                                {/* In a real app we'd have the dish image here, mocking it */}
                                                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${order._id}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="dish" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0F3F26', marginBottom: '2px' }}>
                                                    {order.orderItems?.map(i => i.menuItem?.name || 'Dish').join(', ').substring(0, 30)}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                                                    {order.shippingAddress?.address?.split(',')[0] || 'Customer'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Today, {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Order #{order._id.slice(-5).toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, background: statusBg, color: statusColor }}>
                                                {order.status === 'Accepted' ? 'Confirmed' : order.status}
                                            </span>
                                            <div style={{ fontWeight: 800, color: '#0F3F26', minWidth: '60px', textAlign: 'right' }}>₹{order.totalPrice}</div>
                                            <ChevronDown style={{ transform: 'rotate(-90deg)', color: 'var(--text-muted)', cursor: 'pointer' }} size={16} />
                                        </div>
                                    </div>
                                );
                            })}
                            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                                <Link to="/chef/orders" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                                    View All Orders →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Today's Overview */}
                <div style={{ ...cardBase, gridColumn: window.innerWidth < 1000 ? 'span 2' : 'span 1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26' }}>Today's Overview</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{dateToday}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Orders Received</span>
                            <span style={{ fontWeight: 800, color: '#27ae60', fontSize: '1.1rem' }}>{stats.todayOrders}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Orders Completed</span>
                            <span style={{ fontWeight: 800, color: '#0F3F26', fontSize: '1.1rem' }}>{stats.ordersCompletedToday}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Revenue Today</span>
                            <span style={{ fontWeight: 800, color: '#0F3F26', fontSize: '1.1rem' }}>₹{(stats.todayEarnings || 0).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>New Customers</span>
                            <span style={{ fontWeight: 800, color: '#0F3F26', fontSize: '1.1rem' }}>{stats.newCustomersToday}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Repeat Customers</span>
                            <span style={{ fontWeight: 800, color: '#0F3F26', fontSize: '1.1rem' }}>{stats.repeatCustomersToday}</span>
                        </div>
                        <div style={{ textAlign: 'right', paddingTop: '8px' }}>
                            <Link to="/chef/growth" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                View Full Analytics <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── BOTTOM SECTION (Bookings, Performance, Reviews) ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                {/* Upcoming Bookings */}
                <div style={cardBase}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F3F26' }}>Upcoming Bookings</h3>
                        <Link to="/chef/party-orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    {stats.upcomingBookingsList?.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No upcoming bookings</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(stats.upcomingBookingsList || [{ partyType: 'Birthday Party', date: new Date(), guestCount: 10, status: 'Confirmed' }, { partyType: 'Kitty Party', date: new Date(), guestCount: 8, status: 'Pending' }]).map((booking, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ padding: '10px', background: 'rgba(155, 89, 182, 0.1)', borderRadius: '10px', color: '#9b59b6' }}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#0F3F26', marginBottom: '4px' }}>{booking.partyType}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(booking.date).toLocaleDateString()} • {booking.time || '7:00 PM'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{booking.guestCount} People</span>
                                        <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '10px', fontWeight: 600, background: booking.status === 'Confirmed' ? 'rgba(39,174,96,0.1)' : 'rgba(230,126,34,0.1)', color: booking.status === 'Confirmed' ? '#27ae60' : '#e67e22' }}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Kitchen Performance */}
                <div style={cardBase}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F3F26' }}>Kitchen Performance</h3>
                        <div style={{ position: 'relative' }}>
                            <span onClick={() => {
                                const current = document.getElementById('perf-dropdown');
                                if (current) current.style.display = current.style.display === 'block' ? 'none' : 'block';
                            }} style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                This Week <ChevronDown size={14} />
                            </span>
                            <div id="perf-dropdown" style={{ display: 'none', position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid var(--border-subtle)', zIndex: 100, minWidth: '130px', overflow: 'hidden' }}>
                                <div onClick={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#0F3F26', borderBottom: '1px solid var(--border-subtle)' }}>Today</div>
                                <div onClick={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#0F3F26', borderBottom: '1px solid var(--border-subtle)' }}>This Week</div>
                                <div onClick={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#0F3F26' }}>This Month</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF9E6', border: '1px solid #FFE082', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Star fill="#f39c12" color="#f39c12" size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Rating</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F3F26' }}>{stats.rating || '4.8'}</div>
                                <div style={{ fontSize: '0.7rem', color: '#27ae60' }}>↑ 0.3 vs last week</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Circular gauge mock */}
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#27ae60', fontSize: '0.9rem' }}>
                                {stats.orderCompletionRate}%
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Completion</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26' }}>{stats.orderCompletionRate}%</div>
                                <div style={{ fontSize: '0.7rem', color: '#27ae60' }}>↑ 5% vs last week</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1, padding: '16px', background: '#F8F9FA', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>On-time Delivery</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F3F26' }}>{stats.onTimeDelivery}%</div>
                        </div>
                        <div style={{ flex: 1, padding: '16px', background: '#F8F9FA', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Feedback Score</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F3F26' }}>{stats.feedbackScore}/5</div>
                        </div>
                    </div>
                </div>

                {/* Recent Reviews */}
                <div style={cardBase}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F3F26' }}>Recent Reviews</h3>
                        <Link to="/chef/profile" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    {stats.recentReviews?.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No reviews yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {(stats.recentReviews || [
                                { user: { name: 'Neha Reddy' }, rating: 5, comment: 'Delicious food, homely taste! Biryani was outstanding.', dish: 'Chicken Biryani', createdAt: new Date() },
                                { user: { name: 'Vikram Mehta' }, rating: 4, comment: 'Very good food and on-time delivery.', dish: 'Veg Thali', createdAt: new Date() }
                            ]).slice(0, 2).map((review, i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eee', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.user?.name || 'Customer'}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="user" />
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700, color: '#0F3F26', fontSize: '0.9rem' }}>{review.user?.name || 'Customer'}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f39c12', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {'⭐'.repeat(review.rating || 5)} {(review.rating || 5).toFixed(1)}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0 0 6px 0', lineHeight: 1.4 }}>{review.comment}</p>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {review.dish || 'Order'} • {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── BOTTOM PROMO BANNER ─── */}
            <div style={{ background: 'rgba(39, 174, 96, 0.05)', borderRadius: '16px', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(39, 174, 96, 0.2)', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(39, 174, 96, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#27ae60' }}>
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0F3F26' }}>Want more orders?</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>Create exciting offers and promotions to reach more customers.</p>
                    </div>
                </div>
                <Link to="/chef/offers" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '24px', fontWeight: 600, textDecoration: 'none' }}>
                    Create Offer
                </Link>
            </div>

        </div>
    );
};

export default ChefDashboardPage;
