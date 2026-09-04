import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import { API_URL } from '../../config';

const SuperadminOrders = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cities, setCities] = useState([]);
    const [cityFilter, setCityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/cities`, { headers: { Authorization: `Bearer ${user.token}` } });
                if (res.ok) setCities(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchCities();
    }, [user]);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/superadmin/orders?page=${page}&limit=20&city=${cityFilter}&status=${statusFilter}&search=${debouncedSearch}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.orders);
                    setTotalPages(data.pages);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user, page, cityFilter, statusFilter, debouncedSearch, lastUpdated]);

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Global Orders</h1>
            </div>

            <div className="sa-card" style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search orders by ID..." className="sa-input" style={{ paddingLeft: '40px', width: '100%' }} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="sa-input" style={{ width: 'auto' }} value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}>
                    <option value="All">All Cities</option>
                    {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select className="sa-input" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="All">All Statuses</option>
                    <option value="Placed">Placed</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <button className="sa-btn-outline"><Filter size={16} /> Filters</button>
            </div>

            <div className="sa-card" style={{ padding: 0, overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>City</th>
                                <th>Customer</th>
                                <th>Chef</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No orders found</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order._id}>
                                        <td style={{ fontWeight: 500 }}>#{order._id.slice(-6).toUpperCase()}</td>
                                        <td>{order.city?.name || '-'}</td>
                                        <td>
                                            <div>{order.user?.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.user?.phone}</div>
                                        </td>
                                        <td>{order.chef?.kitchenName || order.chef?.name || '-'}</td>
                                        <td style={{ fontWeight: 600 }}>₹{order.totalPrice}</td>
                                        <td>
                                            <span className={`sa-badge sa-badge-${
                                                order.status === 'Delivered' ? 'success' :
                                                order.status === 'Cancelled' ? 'error' :
                                                order.status === 'Placed' ? 'warning' : 'primary'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
                
                {totalPages > 1 && (
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                        <button className="sa-btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="sa-btn-outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperadminOrders;
