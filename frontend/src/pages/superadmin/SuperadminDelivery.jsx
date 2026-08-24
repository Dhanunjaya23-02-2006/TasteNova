import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { Truck, Search, Filter } from 'lucide-react';
import { API_URL } from '../../config';

const SuperadminDelivery = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [partners, setPartners] = useState([]);
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
        const fetchDelivery = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/superadmin/delivery?page=${page}&limit=20&city=${cityFilter}&status=${statusFilter}&search=${debouncedSearch}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPartners(data.partners);
                    setTotalPages(data.pages);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchDelivery();
    }, [user, page, cityFilter, statusFilter, debouncedSearch, lastUpdated]);

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Global Delivery Partners</h1>
            </div>

            <div className="sa-card" style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search delivery partners..." className="sa-input" style={{ paddingLeft: '40px', width: '100%' }} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="sa-input" style={{ width: 'auto' }} value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}>
                    <option value="All">All Cities</option>
                    {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select className="sa-input" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="All">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending Approval</option>
                    <option value="suspended">Suspended</option>
                </select>
                <button className="sa-btn-outline"><Filter size={16} /> Filters</button>
            </div>

            <div className="sa-card" style={{ padding: 0, overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading delivery partners...</div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>City</th>
                                <th>Contact</th>
                                <th>Rating</th>
                                <th>Status</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partners.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No delivery partners found</td></tr>
                            ) : (
                                partners.map(partner => (
                                    <tr key={partner._id}>
                                        <td style={{ fontWeight: 500 }}>{partner.name}</td>
                                        <td>{partner.city?.name || '-'}</td>
                                        <td>
                                            <div>{partner.phone}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{partner.email}</div>
                                        </td>
                                        <td>{partner.rating > 0 ? `⭐ ${partner.rating.toFixed(1)}` : 'New'}</td>
                                        <td>
                                            <span className={`sa-badge sa-badge-${
                                                partner.status === 'active' ? 'success' :
                                                partner.status === 'suspended' ? 'error' : 'warning'
                                            }`}>
                                                {partner.status}
                                            </span>
                                        </td>
                                        <td>{new Date(partner.createdAt).toLocaleDateString()}</td>
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

export default SuperadminDelivery;
