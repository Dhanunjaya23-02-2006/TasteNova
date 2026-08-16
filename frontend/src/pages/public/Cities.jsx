import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const Cities = () => {
    const [activeCities, setActiveCities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await fetch(`${API_URL}/cities`);
                if (res.ok) {
                    const data = await res.json();
                    setActiveCities(data);
                } else {
                    toast.error('Failed to load cities');
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCities();
    }, []);

    return (
        <div className="container" style={{ paddingTop: '60px' }}>
            <h1 className="hero-heading text-center" style={{ marginBottom: '20px' }}>Cities We Serve</h1>
            <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '60px' }}>TasteNova is rapidly expanding. Find us in your city!</p>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading cities...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {activeCities.filter(city => city.isActive !== false).map(city => (
                        <div key={city._id || city.name} style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MapPin size={20} color="var(--primary)" />
                            </div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{city.name}</span>
                        </div>
                    ))}
                </div>
            )}
            
            <div style={{ marginTop: '60px', textAlign: 'center', padding: '40px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
                <h3>Don't see your city?</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>We are launching in new locations every month. Stay tuned!</p>
            </div>
        </div>
    );
};

export default Cities;