import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Users, Search, Filter, UserCheck, UserPlus, UserX, Eye, X, ShoppingBag, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const SuperadminCustomers = () => {
    const { user } = useContext(AuthContext);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [cities, setCities] = useState([]);
    const [cityFilter, setCityFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');
    const [stats, setStats] = useState({ totalCustomers: 0, activeCustomers: 0, newThisMonth: 0, suspendedCustomers: 0 });
    
    // Detail Modal
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [customerDetail, setCustomerDetail] = useState(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setSearchDebounce(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/cities`, { headers: { Authorization: `Bearer ${user.token}` } });
                if (res.ok) setCities(await res.json());
            } catch (e) { console.error(e); }
        };
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/customer-stats`, { headers: { Authorization: `Bearer ${user.token}` } });
                if (res.ok) setStats(await res.json());
            } catch (e) { console.error(e); }
        };
        if (user) {
            fetchCities();
            fetchStats();
        }
    }, [user]);

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ page, limit: 20, city: cityFilter });
                if (searchDebounce) params.set('search', searchDebounce);
                
                const res = await fetch(`${API_URL}/superadmin/customers?${params}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCustomers(data.customers);
                    setTotalPages(data.pages);
                    setTotal(data.total);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchCustomers();
    }, [user, page, cityFilter, searchDebounce]);

    const viewCustomerDetail = async (customerId) => {
        setSelectedCustomer(customerId);
        setDetailLoading(true);
        try {
            const res = await fetch(`${API_URL}/superadmin/customers/${customerId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setCustomerDetail(await res.json());
        } catch (e) { console.error(e); }
        finally { setDetailLoading(false); }
    };

    const updateStatus = async (customerId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/superadmin/customers/${customerId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                toast.success(`Customer ${newStatus === 'active' ? 'activated' : 'suspended'}`);
                // Refresh
                setCustomers(prev => prev.map(c => c._id === customerId ? { ...c, status: newStatus } : c));
                setStats(prev => ({
                    ...prev,
                    activeCustomers: newStatus === 'active' ? prev.activeCustomers + 1 : prev.activeCustomers - 1,
                    suspendedCustomers: newStatus === 'suspended' ? prev.suspendedCustomers + 1 : prev.suspendedCustomers - 1
                }));
                if (customerDetail?._id === customerId) {
                    setCustomerDetail(prev => ({ ...prev, status: newStatus }));
                }
            } else {
                const err = await res.json();
                toast.error(err.message || 'Error updating status');
            }
        } catch (e) { toast.error('Error updating status'); }
    };

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Global Customers</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        View and manage all registered customers across cities.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Customers</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalCustomers}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserCheck size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.activeCustomers}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserPlus size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>New This Month</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.newThisMonth}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserX size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Suspended</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.suspendedCustomers}</div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="sa-card" style={{ marginBottom: '20px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        className="sa-input"
                        style={{ paddingLeft: '36px', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                </div>
                <select className="sa-input" style={{ width: 'auto', minWidth: '140px' }} value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}>
                    <option value="All">All Cities</option>
                    {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {total} customer{total !== 1 ? 's' : ''} found
                </div>
            </div>

            {/* Table */}
            <div className="sa-card" style={{ padding: 0, overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }}></div>
                        Loading customers...
                    </div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>City</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Orders</th>
                                <th>Total Spend</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                    <Users size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                                    <div>No customers found</div>
                                </td></tr>
                            ) : (
                                customers.map(customer => (
                                    <tr key={customer._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                                                    {customer.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{customer.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{customer.city?.name || '—'}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{customer.email}</td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{customer.phone}</td>
                                        <td style={{ fontWeight: 600 }}>{customer.totalOrders || 0}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{(customer.totalSpend || 0).toLocaleString()}</td>
                                        <td>
                                            <span className={`sa-badge ${
                                                customer.status === 'active' ? 'sa-badge-green' :
                                                customer.status === 'suspended' ? 'sa-badge-red' : 'sa-badge-yellow'
                                            }`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '4px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    onClick={() => viewCustomerDetail(customer._id)}
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                                {customer.status === 'active' ? (
                                                    <button
                                                        style={{ background: 'rgba(231, 76, 60, 0.08)', border: '1px solid rgba(231, 76, 60, 0.2)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.78rem', color: '#e74c3c', cursor: 'pointer', fontWeight: 500 }}
                                                        onClick={() => updateStatus(customer._id, 'suspended')}
                                                    >
                                                        Suspend
                                                    </button>
                                                ) : (
                                                    <button
                                                        style={{ background: 'rgba(39, 174, 96, 0.08)', border: '1px solid rgba(39, 174, 96, 0.2)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.78rem', color: '#27ae60', cursor: 'pointer', fontWeight: 500 }}
                                                        onClick={() => updateStatus(customer._id, 'active')}
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Page {page} of {totalPages}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="sa-btn-outline" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <button className="sa-btn-outline" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedCustomer(null); setCustomerDetail(null); } }}>
                    <div className="sa-card" style={{ width: '100%', maxWidth: '600px', padding: '28px', position: 'relative', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => { setSelectedCustomer(null); setCustomerDetail(null); }} />
                        
                        {detailLoading ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customer details...</div>
                        ) : customerDetail ? (
                            <>
                                {/* Customer Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
                                        {customerDetail.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem' }}>{customerDetail.name}</h3>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{customerDetail.email} • {customerDetail.phone}</div>
                                        <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className={`sa-badge ${customerDetail.status === 'active' ? 'sa-badge-green' : 'sa-badge-red'}`}>{customerDetail.status}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Joined {new Date(customerDetail.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                                        <ShoppingBag size={20} style={{ color: 'var(--primary)', marginBottom: '6px' }} />
                                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{customerDetail.totalOrders}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Orders</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                                        <Wallet size={20} style={{ color: 'var(--primary)', marginBottom: '6px' }} />
                                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>₹{(customerDetail.totalSpend || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Spend</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                                        <Wallet size={20} style={{ color: '#3498db', marginBottom: '6px' }} />
                                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>₹{(customerDetail.walletBalance || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Wallet</div>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600 }}>Recent Orders</h4>
                                    {customerDetail.recentOrders?.length === 0 ? (
                                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-dark)', borderRadius: '8px', fontSize: '0.9rem' }}>
                                            No orders yet
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {customerDetail.recentOrders?.slice(0, 5).map(order => (
                                                <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-dark)', borderRadius: '8px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.chef?.kitchenName || order.chef?.name || 'Unknown'}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{order.totalPrice}</div>
                                                        <span className={`sa-badge ${
                                                            order.status === 'Delivered' ? 'sa-badge-green' :
                                                            order.status === 'Cancelled' || order.status === 'Rejected' ? 'sa-badge-red' : 'sa-badge-yellow'
                                                        }`} style={{ fontSize: '0.7rem' }}>{order.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    {customerDetail.status === 'active' ? (
                                        <button className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => updateStatus(customerDetail._id, 'suspended')}>
                                            Suspend Customer
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => updateStatus(customerDetail._id, 'active')}>
                                            Activate Customer
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Failed to load customer details</div>
                        )}
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default SuperadminCustomers;
