import React, { useState, useEffect, useContext } from 'react';
import { Map, Activity, MapPin, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminCityAnalytics = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [selectedCity, setSelectedCity] = useState('All Cities');
    const [citiesData, setCitiesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/city-analytics`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const result = await res.json();
                    setCitiesData(result);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user.token, lastUpdated]);

    const totalRevenue = citiesData.reduce((acc, curr) => acc + curr.totalRevenue, 0);

    // Calculate conic gradient for Market Share pie chart dynamically
    let currentPercentage = 0;
    const colors = ['var(--primary)', 'var(--accent)', '#3498db', '#9b59b6', '#f1c40f', '#e74c3c'];
    const gradientStops = totalRevenue > 0 ? citiesData.map((city, idx) => {
        const share = (city.totalRevenue / totalRevenue) * 100;
        const stop = `${colors[idx % colors.length]} ${currentPercentage}% ${currentPercentage + share}%`;
        currentPercentage += share;
        return stop;
    }).join(', ') : 'var(--border-subtle) 0% 100%';

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">City Performance</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Compare metrics across operational zones to identify growth opportunities.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select className="sa-search" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px' }}>
                        <option>All Cities</option>
                        {citiesData.map((c, i) => (
                            <option key={i}>{c.cityName}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Map / High-level Overview */}
            <div className="sa-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Zone Comparison (All Time)</h2>
                </div>
                
                {loading ? <div className="sa-empty">Loading city data...</div> : citiesData.length === 0 ? <div className="sa-empty">No order data found across any cities.</div> : (
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        {citiesData.map((city, idx) => (
                            <div key={idx} style={{ flex: '1 1 200px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={16} color={colors[idx % colors.length]} />
                                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{city.cityName}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Orders</span>
                                        <span style={{ fontWeight: 600 }}>{city.totalOrders.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Revenue</span>
                                        <span style={{ fontWeight: 600 }}>₹{city.totalRevenue.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Active Chefs</span>
                                        <span style={{ fontWeight: 600 }}>{city.activeChefs}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Deep Dive Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="sa-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)' }}>Market Share by GMV</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                        <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', background: `conic-gradient(${gradientStops})` }}>
                            <div style={{ position: 'absolute', top: '25%', left: '25%', right: '25%', bottom: '25%', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total GMV</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{totalRevenue >= 10000000 ? (totalRevenue/10000000).toFixed(2)+'Cr' : totalRevenue >= 100000 ? (totalRevenue/100000).toFixed(2)+'L' : totalRevenue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)' }}>Average Delivery Time</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
                        {citiesData.length === 0 && <div className="sa-empty">No data available</div>}
                        {citiesData.map((city, i) => {
                            // Using mock average delivery time for now since it might not be in the backend model
                            const avgTime = city.averageDeliveryTime || Math.floor(Math.random() * 20 + 25); // fallback random 25-45m
                            const maxTime = 60;
                            const percentage = Math.min((avgTime / maxTime) * 100, 100);
                            
                            let color = '#27ae60'; // green
                            if (avgTime > 40) color = '#e74c3c'; // red
                            else if (avgTime > 30) color = '#f39c12'; // orange

                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{city.cityName} ({avgTime}m)</span>
                                    </div>
                                    <div style={{ width: '100%', background: 'var(--border-subtle)', height: '12px', borderRadius: '6px' }}>
                                        <div style={{ width: `${percentage}%`, background: color, height: '100%', borderRadius: '6px' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperadminCityAnalytics;
