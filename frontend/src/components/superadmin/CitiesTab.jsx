import React from 'react';
import { motion } from 'framer-motion';

const CitiesTab = ({ cities, cityData, setCityData, handleAddCity }) => {
    return (
        <motion.div key="cities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Operating Cities</h2>
            <div className="glass-panel mb-5" style={{ padding: '24px', maxWidth: '600px', marginBottom: '30px' }}>
                <h4 className="mb-4">Add Operating Region</h4>
                <form onSubmit={handleAddCity} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="input-group">
                        <label>City Name</label>
                        <input type="text" className="form-control" placeholder="e.g. Hyderabad" required value={cityData.name} onChange={(e) => setCityData({...cityData, name: e.target.value})} />
                    </div>
                    <div className="input-group">
                        <label>State</label>
                        <input type="text" className="form-control" placeholder="e.g. Telangana" required value={cityData.state} onChange={(e) => setCityData({...cityData, state: e.target.value})} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Launch New City</button>
                </form>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {cities.map(city => (
                    <div key={city._id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h5 style={{ margin: '0 0 5px 0' }}>{city.name}</h5>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{city.state}</p>
                        </div>
                        <span className="status-badge status-success">Active</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default CitiesTab;
