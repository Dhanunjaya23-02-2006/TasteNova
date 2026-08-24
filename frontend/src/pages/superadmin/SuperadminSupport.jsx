import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { MessageCircle, Search, Filter } from 'lucide-react';
import { API_URL } from '../../config';

const SuperadminSupport = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [tickets, setTickets] = useState([]);
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
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/superadmin/support?page=${page}&limit=20&city=${cityFilter}&status=${statusFilter}&search=${debouncedSearch}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTickets(data.tickets);
                    setTotalPages(data.pages);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [user, page, cityFilter, statusFilter, debouncedSearch, lastUpdated]);

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Global Support Tickets</h1>
            </div>

            <div className="sa-card" style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search tickets by subject..." className="sa-input" style={{ paddingLeft: '40px', width: '100%' }} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="sa-input" style={{ width: 'auto' }} value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}>
                    <option value="All">All Cities</option>
                    {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select className="sa-input" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <button className="sa-btn-outline"><Filter size={16} /> Filters</button>
            </div>

            <div className="sa-card" style={{ padding: 0, overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading support tickets...</div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Subject</th>
                                <th>City</th>
                                <th>Customer</th>
                                <th>Order ID</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No support tickets found</td></tr>
                            ) : (
                                tickets.map(ticket => (
                                    <tr key={ticket._id}>
                                        <td style={{ fontWeight: 500 }}>#{ticket._id.slice(-6).toUpperCase()}</td>
                                        <td>{ticket.subject}</td>
                                        <td>{ticket.city?.name || '-'}</td>
                                        <td>
                                            <div>{ticket.customer?.name}</div>
                                        </td>
                                        <td>{ticket.order ? `#${ticket.order._id.slice(-6).toUpperCase()}` : '-'}</td>
                                        <td>
                                            <span className={`sa-badge sa-badge-${
                                                ticket.status === 'Resolved' ? 'success' :
                                                ticket.status === 'Open' ? 'error' : 'warning'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
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

export default SuperadminSupport;
