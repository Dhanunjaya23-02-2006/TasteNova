import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChefHat, Search, Filter } from 'lucide-react';
import { API_URL } from '../../config';

const SuperadminChefs = () => {
    const { user } = useContext(AuthContext);
    const [chefs, setChefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cities, setCities] = useState([]);
    const [cityFilter, setCityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

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
        const fetchChefs = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/superadmin/chefs?page=${page}&limit=20&city=${cityFilter}&status=${statusFilter}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setChefs(data.chefs);
                    setTotalPages(data.pages);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchChefs();
    }, [user, page, cityFilter, statusFilter]);

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Global Chefs</h1>
            </div>

            <div className="sa-card" style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search chefs (Phase 3)..." className="sa-input" style={{ paddingLeft: '40px', width: '100%' }} disabled />
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
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading chefs...</div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Chef / Kitchen</th>
                                <th>City</th>
                                <th>Contact</th>
                                <th>Rating</th>
                                <th>Status</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chefs.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No chefs found</td></tr>
                            ) : (
                                chefs.map(chef => (
                                    <tr key={chef._id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{chef.kitchenName || chef.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{chef.name}</div>
                                        </td>
                                        <td>{chef.city?.name || '-'}</td>
                                        <td>
                                            <div>{chef.phone}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{chef.email}</div>
                                        </td>
                                        <td>{chef.rating > 0 ? `⭐ ${chef.rating.toFixed(1)} (${chef.numReviews})` : 'New'}</td>
                                        <td>
                                            <span className={`sa-badge sa-badge-${
                                                chef.status === 'active' ? 'success' :
                                                chef.status === 'suspended' ? 'error' : 'warning'
                                            }`}>
                                                {chef.status}
                                            </span>
                                        </td>
                                        <td>{new Date(chef.createdAt).toLocaleDateString()}</td>
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

export default SuperadminChefs;
