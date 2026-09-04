import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { MapPin, Globe, Navigation, Truck, IndianRupee, Package, ChefHat, Users, ShoppingBag } from 'lucide-react';

const SubadminAssignedCity = () => {
    const { user } = useContext(AuthContext);
    const [cities, setCities] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCityData = async () => {
            try {
                // Fetch city info
                const citiesRes = await fetch(`${API_URL}/cities`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (citiesRes.ok) {
                    const allCities = await citiesRes.json();
                    const myCities = allCities.filter(c => 
                        (user.assignedCities && user.assignedCities.includes(c._id)) || 
                        c._id === user.city
                    );
                    setCities(myCities);
                }

                // Fetch dashboard stats for context
                const dashRes = await fetch(`${API_URL}/subadmin/dashboard`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (dashRes.ok) {
                    const dashData = await dashRes.json();
                    setStats(dashData.stats);
                }
            } catch (e) {
                console.error('Failed to fetch city data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchCityData();
    }, [user]);

    if (loading) return <div className="sa-empty">Loading zone data...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Assigned Zones</h1>
            </div>

            {cities.length === 0 ? (
                <div className="sa-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <MapPin size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No Zones Assigned</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Contact your Super Admin to get zones assigned to your account.
                    </p>
                </div>
            ) : (
                <>
                    {cities.map((city, index) => (
                        <div key={city._id || index} style={{ marginBottom: '40px' }}>
                            {/* City Hero Card */}
                            <div className="sa-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #1A3C2A 0%, #2D5A3E 100%)', color: '#fff', border: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin size={36} />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: '0 0 4px 0', fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem' }}>{city.name}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8, fontSize: '0.95rem' }}>
                                            <Globe size={16} /> {city.state}, {city.country}
                                        </div>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            background: city.isActive ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                                            color: city.isActive ? '#2ecc71' : '#e74c3c'
                                        }}>
                                            {city.isActive ? '● Active' : '● Inactive'}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick stats row - Displayed only for the first city if stats are aggregated */}
                                {stats && index === 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                                        {[
                                            { label: 'Chefs', value: stats.totalChefs || 0, icon: ChefHat },
                                            { label: 'Customers', value: stats.totalCustomers || 0, icon: Users },
                                            { label: 'Orders Today', value: stats.todayOrders || 0, icon: ShoppingBag },
                                        ].map((s, i) => (
                                            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                                <s.icon size={18} style={{ marginBottom: '6px', opacity: 0.8 }} />
                                                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.value}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>



                            {/* Financial Settings */}
                            <div className="sa-card" style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', fontFamily: "'DM Serif Display', serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IndianRupee size={20} style={{ color: 'var(--primary)' }} /> Financial Settings
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>Commission Rate</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{city.commissionRate || 15}%</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Platform fee per order</div>
                                    </div>
                                    <div style={{ padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>Refund Threshold</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>₹{city.refundThreshold || 500}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Max auto-approve limit</div>
                                    </div>
                                </div>
                            </div>

                            {/* Zones */}
                            <div className="sa-card" style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Navigation size={20} style={{ color: 'var(--primary)' }} /> Service Zones
                                </h3>
                                {city.zones && city.zones.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {city.zones.map((zone, i) => {
                                            // Highlight assigned zones if the subadmin has specific zones assigned
                                            const isAssignedZone = user.assignedZones && user.assignedZones.includes(zone);
                                            const hasSpecificZones = user.assignedZones && user.assignedZones.length > 0;
                                            
                                            return (
                                                <span key={i} style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    background: hasSpecificZones && !isAssignedZone ? 'var(--bg-dark)' : 'var(--primary-light)',
                                                    color: hasSpecificZones && !isAssignedZone ? 'var(--text-muted)' : 'var(--primary)',
                                                    fontWeight: hasSpecificZones && !isAssignedZone ? 400 : 600,
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {zone} {hasSpecificZones && isAssignedZone ? ' (Assigned)' : ''}
                                                </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                        No zones configured for this city. Contact your Super Admin to set up delivery zones.
                                    </p>
                                )}
                            </div>

                            {/* Coordinates */}
                            {(city.latitude && city.longitude) && (
                                <div className="sa-card" style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', fontFamily: "'DM Serif Display', serif" }}>📍 Coordinates</h3>
                                    <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <span><strong>Lat:</strong> {city.latitude?.toFixed(4)}</span>
                                        <span><strong>Lng:</strong> {city.longitude?.toFixed(4)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div style={{ padding: '12px 0', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Configuration changes require Super Admin access.
                    </div>
                </>
            )}
        </div>
    );
};

export default SubadminAssignedCity;
