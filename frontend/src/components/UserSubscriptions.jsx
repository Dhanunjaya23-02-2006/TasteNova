import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

const UserSubscriptions = () => {
    const { user } = useContext(AuthContext);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch(`${API_URL}/subscriptions/my`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setSubscriptions(await res.json());
            }
        } catch (error) {
            console.error('Error fetching subscriptions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (subId, action) => {
        try {
            const res = await fetch(`${API_URL}/subscriptions/${subId}/${action}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                toast.success(`Subscription ${action}ed successfully`);
                fetchSubscriptions();
            } else {
                toast.error(`Failed to ${action} subscription`);
            }
        } catch (error) {
            toast.error(`Error performing action`);
        }
    };

    if (loading) return <p>Loading subscriptions...</p>;

    if (subscriptions.length === 0) return (
        <div className="glass-panel text-center" style={{ padding: '40px' }}>
            <p style={{ color: 'var(--text-muted)' }}>You don't have any active subscriptions yet.</p>
        </div>
    );

    return (
        <div style={{ display: 'grid', gap: '20px' }}>
            {subscriptions.map(sub => (
                <div key={sub._id} className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: 'var(--primary-color)' }}>{sub.plan.name}</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Chef: {sub.chef.businessName || sub.chef.name}</p>
                        </div>
                        <span className={`status-badge ${sub.status === 'Active' ? 'status-active' : sub.status === 'Paused' ? 'status-pending' : 'status-info'}`}>
                            {sub.status}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                        <div><strong>Start Date:</strong> {new Date(sub.startDate).toLocaleDateString()}</div>
                        <div><strong>End Date:</strong> {new Date(sub.endDate).toLocaleDateString()}</div>
                        <div><strong>Delivery Time:</strong> {sub.selectedTimeSlot}</div>
                        <div><strong>Meals Remaining:</strong> {sub.remainingMeals}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {sub.status === 'Active' && (
                            <>
                                <button className="btn btn-outline" style={{ padding: '8px 15px', fontSize: '0.85rem' }} onClick={() => handleAction(sub._id, 'pause')}>Pause Subscription</button>
                                <button className="btn btn-outline" style={{ padding: '8px 15px', fontSize: '0.85rem', borderColor: '#ff4d4d', color: '#ff4d4d' }} onClick={() => handleAction(sub._id, 'cancel')}>Cancel</button>
                            </>
                        )}
                        {sub.status === 'Paused' && (
                            <button className="btn btn-primary" style={{ padding: '8px 15px', fontSize: '0.85rem' }} onClick={() => handleAction(sub._id, 'resume')}>Resume Subscription</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserSubscriptions;
