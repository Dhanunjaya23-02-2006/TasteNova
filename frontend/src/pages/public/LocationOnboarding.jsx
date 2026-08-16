import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';

const LocationOnboarding = () => {
    const navigate = useNavigate();
    const [city, setCity] = useState('');

    const handleSave = () => {
        if (!city) return;
        sessionStorage.setItem('selectedCity', JSON.stringify({ type: 'manual', cityName: city, lat: 17.4, lng: 78.4 }));
        navigate('/');
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <MapPin size={40} color="var(--primary)" />
                </div>
                
                <h2 style={{ marginBottom: '10px' }}>Where should we deliver?</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Help us find the best home chefs near your location.</p>

                <button className="btn btn-primary" style={{ width: '100%', padding: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Navigation size={20} /> Use Current Location
                </button>

                <div style={{ position: 'relative', margin: '20px 0' }}>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
                    <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-surface)', padding: '0 10px', color: 'var(--text-muted)' }}>OR</span>
                </div>

                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Select City Manually</label>
                    <select className="form-control" value={city} onChange={(e) => setCity(e.target.value)}>
                        <option value="">Select a city...</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Bengaluru">Bengaluru</option>
                    </select>
                </div>

                <button onClick={handleSave} disabled={!city} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                    Continue to App
                </button>
            </div>
        </div>
    );
};

export default LocationOnboarding;