import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

const ChefSettings = () => {
    const { user, login } = useContext(AuthContext); // to update user in context if needed
    const [lunch, setLunch] = useState({ start: '12:00', end: '14:00', cutoff: '10:30', active: true });
    const [dinner, setDinner] = useState({ start: '19:00', end: '21:00', cutoff: '17:30', active: true });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.operatingHours) {
            if (user.operatingHours.lunch) setLunch(user.operatingHours.lunch);
            if (user.operatingHours.dinner) setDinner(user.operatingHours.dinner);
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/operating-hours`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({ lunch, dinner })
            });

            if (res.ok) {
                const updatedHours = await res.json();
                toast.success('Operating hours updated successfully!');
                
                // Update local storage / context user object
                const updatedUser = { ...user, operatingHours: updatedHours };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                login(updatedUser); // Update context
            } else {
                toast.error('Failed to update operating hours');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>Operating Hours</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>
                Set your lunch and dinner serving times, and cutoff times for scheduled/subscription orders.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                {/* Lunch Settings */}
                <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0 }}>Lunch</h4>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <input type="checkbox" checked={lunch.active} onChange={e => setLunch({...lunch, active: e.target.checked})} />
                            Active
                        </label>
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Start Time</label>
                        <input type="time" value={lunch.start} onChange={e => setLunch({...lunch, start: e.target.value})} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>End Time</label>
                        <input type="time" value={lunch.end} onChange={e => setLunch({...lunch, end: e.target.value})} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Order Cutoff Time</label>
                        <input type="time" value={lunch.cutoff} onChange={e => setLunch({...lunch, cutoff: e.target.value})} className="form-control" />
                    </div>
                </div>

                {/* Dinner Settings */}
                <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0 }}>Dinner</h4>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <input type="checkbox" checked={dinner.active} onChange={e => setDinner({...dinner, active: e.target.checked})} />
                            Active
                        </label>
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Start Time</label>
                        <input type="time" value={dinner.start} onChange={e => setDinner({...dinner, start: e.target.value})} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>End Time</label>
                        <input type="time" value={dinner.end} onChange={e => setDinner({...dinner, end: e.target.value})} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Order Cutoff Time</label>
                        <input type="time" value={dinner.cutoff} onChange={e => setDinner({...dinner, cutoff: e.target.value})} className="form-control" />
                    </div>
                </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
    );
};

export default ChefSettings;
