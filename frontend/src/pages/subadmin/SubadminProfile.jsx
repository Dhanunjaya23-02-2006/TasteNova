import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Shield, MapPin, Mail, Clock } from 'lucide-react';
import { API_URL } from '../../config';

const SubadminProfile = () => {
    const { user } = useContext(AuthContext);
    const [cityName, setCityName] = useState('Loading...');

    useEffect(() => {
        const fetchCity = async () => {
            if (user?.city || (user?.assignedCities && user.assignedCities.length > 0)) {
                try {
                    const res = await fetch(`${API_URL}/cities`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    if (res.ok) {
                        const cities = await res.json();
                        const myCities = cities.filter(c => 
                            (user.assignedCities && user.assignedCities.includes(c._id)) || 
                            c._id === user.city
                        );
                        if (myCities.length > 0) setCityName(myCities.map(c => c.name).join(', '));
                        else setCityName('City Not Found');
                    }
                } catch (e) {
                    setCityName('Error loading city');
                }
            } else {
                setCityName('Unassigned');
            }
        };
        fetchCity();
    }, [user]);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="sa-page-header">
                <h1 className="sa-page-title">My Profile</h1>
            </div>

            <div className="sa-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600 }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ margin: '0 0 4px 0', fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem' }}>{user.name}</h2>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={14} /> City Sub-Admin
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <MapPin size={20} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned Region</div>
                            <div style={{ fontWeight: 500 }}>{cityName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Only Super Admins can change your assigned region.</div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Mail size={20} style={{ color: 'var(--primary)' }} />
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email</div>
                            <div style={{ fontWeight: 500 }}>{user.email}</div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock size={20} style={{ color: 'var(--primary)' }} />
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Account Created</div>
                            <div style={{ fontWeight: 500 }}>{new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <a href="/subadmin/assigned-zones" style={{ textDecoration: 'none' }}>
                    <div className="sa-card" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }} 
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }} 
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none' }}
                    >
                        <MapPin size={24} style={{ color: 'var(--primary)', margin: '0 auto 12px auto' }} />
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Assigned Zones</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View city config & zones</div>
                    </div>
                </a>
                <a href="/subadmin/permissions" style={{
                    textDecoration: 'none'
                }}>
                    <div className="sa-card" style={{ textAlign: 'center', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Shield size={24} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>Permissions</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>View your access rights</div>
                    </div>
                </a>
            </div>
        </div>
    );
};

export default SubadminProfile;
