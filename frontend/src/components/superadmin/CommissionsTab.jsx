import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';
import { motion } from 'framer-motion';

const CommissionsTab = ({ user }) => {
    const [settings, setSettings] = useState({
        global: 15,
        cityOverrides: [],
        chefOverrides: [],
        allCities: [],
        allChefs: []
    });

    const [globalRate, setGlobalRate] = useState(15);
    const [selectedCity, setSelectedCity] = useState('');
    const [cityRate, setCityRate] = useState('');
    const [selectedChef, setSelectedChef] = useState('');
    const [chefRate, setChefRate] = useState('');

    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/commissions`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
                setGlobalRate(data.global);
            }
        } catch (error) {
            console.error('Error fetching commissions', error);
        }
    };

    const handleUpdateGlobal = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/commissions/global`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ rate: globalRate })
            });
            if (res.ok) {
                toast.success('Global Default Commission Updated');
                fetchCommissions();
            } else toast.error('Failed to update');
        } catch (error) { toast.error('Error updating'); }
    };

    const handleUpdateCity = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/commissions/city/${selectedCity}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ rate: cityRate }) // send empty to remove override
            });
            if (res.ok) {
                toast.success('City Commission Override Updated');
                setSelectedCity('');
                setCityRate('');
                fetchCommissions();
            } else toast.error('Failed to update');
        } catch (error) { toast.error('Error updating'); }
    };

    const handleUpdateChef = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/commissions/chef/${selectedChef}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ rate: chefRate })
            });
            if (res.ok) {
                toast.success('Chef Commission Override Updated');
                setSelectedChef('');
                setChefRate('');
                fetchCommissions();
            } else toast.error('Failed to update');
        } catch (error) { toast.error('Error updating'); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Commission Settings</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', marginBottom: '40px' }}>
                
                {/* GLOBAL LEVEL */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '20px' }}>
                        1. Global Default
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        This is the base commission rate applied to all chefs across the platform, unless overridden at the city or chef level.
                    </p>
                    <form onSubmit={handleUpdateGlobal} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', maxWidth: '400px' }}>
                        <div className="input-group flex-1">
                            <label>Base Commission (%)</label>
                            <input type="number" className="form-control" value={globalRate} onChange={e => setGlobalRate(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '14px 20px' }}>Update Default</button>
                    </form>
                </div>

                {/* CITY LEVEL */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '20px' }}>
                        2. City Overrides
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Set a specific rate for a city. This overrides the Global Default for all chefs within that city.
                    </p>
                    
                    <form onSubmit={handleUpdateCity} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '30px' }}>
                        <div className="input-group flex-1">
                            <label>Select City</label>
                            <select className="form-control" value={selectedCity} onChange={e => setSelectedCity(e.target.value)} required>
                                <option value="">-- Choose City --</option>
                                {settings.allCities.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}, {c.state}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group flex-1">
                            <label>Custom Rate (%)</label>
                            <input type="number" className="form-control" placeholder="Leave blank to remove" value={cityRate} onChange={e => setCityRate(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '14px 20px' }}>Save City Rate</button>
                    </form>

                    {settings.cityOverrides.length > 0 && (
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '10px' }}>City</th>
                                    <th style={{ padding: '10px' }}>Custom Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settings.cityOverrides.map(c => (
                                    <tr key={c._id}>
                                        <td data-label="City" style={{ padding: '10px' }}>{c.name}, {c.state}</td>
                                        <td data-label="Custom Rate" style={{ padding: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>{c.commissionRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* CHEF LEVEL */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '20px' }}>
                        3. Chef Overrides
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Set a specific rate for an individual chef. This overrides both the City and Global rates.
                    </p>

                    <form onSubmit={handleUpdateChef} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '30px' }}>
                        <div className="input-group flex-1">
                            <label>Select Chef</label>
                            <select className="form-control" value={selectedChef} onChange={e => setSelectedChef(e.target.value)} required>
                                <option value="">-- Choose Chef --</option>
                                {settings.allChefs.map(c => (
                                    <option key={c._id} value={c._id}>{c.kitchenName || c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group flex-1">
                            <label>Custom Rate (%)</label>
                            <input type="number" className="form-control" placeholder="Leave blank to remove" value={chefRate} onChange={e => setChefRate(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '14px 20px' }}>Save Chef Rate</button>
                    </form>

                    {settings.chefOverrides.length > 0 && (
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '10px' }}>Chef / Kitchen</th>
                                    <th style={{ padding: '10px' }}>City</th>
                                    <th style={{ padding: '10px' }}>Custom Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settings.chefOverrides.map(c => (
                                    <tr key={c._id}>
                                        <td data-label="Chef / Kitchen" style={{ padding: '10px' }}>{c.kitchenName || c.name}</td>
                                        <td data-label="City" style={{ padding: '10px' }}>{c.city?.name || 'Unknown'}</td>
                                        <td data-label="Custom Rate" style={{ padding: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>{c.commissionRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </motion.div>
    );
};

export default CommissionsTab;
