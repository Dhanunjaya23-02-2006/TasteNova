import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import { Plus, Trash2, PackagePlus } from 'lucide-react';

const ChefPlans = () => {
    const { user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlan, setNewPlan] = useState({
        name: '', description: '', type: 'Weekly', mealType: 'Lunch', price: '',
        weeklyMenu: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    });

    useEffect(() => {
        fetchPlans();
        fetchMenu();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_URL}/subscriptions/plans?chef=${user._id}`);
            if (res.ok) setPlans(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchMenu = async () => {
        try {
            const res = await fetch(`${API_URL}/menu?chef=${user._id}`);
            if (res.ok) setMenuItems(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/subscriptions/plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(newPlan)
            });
            if (res.ok) {
                toast.success('Plan created!');
                setIsCreating(false);
                fetchPlans();
            } else {
                toast.error('Failed to create plan');
            }
        } catch (error) {
            toast.error('Error creating plan');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--primary-color)', margin: 0 }}>Subscription Plans</h3>
                <button className="btn btn-primary" onClick={() => setIsCreating(!isCreating)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isCreating ? 'Cancel' : <><Plus size={18} /> Create Plan</>}
                </button>
            </div>

            {isCreating && (
                <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                    <h4>Create New Plan</h4>
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className="form-group">
                                <label>Plan Name (e.g. Weekly Veg Lunch)</label>
                                <input type="text" className="form-control" required value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Price (₹)</label>
                                <input type="number" className="form-control" required value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Plan Type</label>
                                <select className="form-control" value={newPlan.type} onChange={e => setNewPlan({...newPlan, type: e.target.value})}>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Meal Type</label>
                                <select className="form-control" value={newPlan.mealType} onChange={e => setNewPlan({...newPlan, mealType: e.target.value})}>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Both">Both (Lunch + Dinner)</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Description</label>
                            <textarea className="form-control" required value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} />
                        </div>
                        
                        <div style={{ padding: '15px', background: 'var(--bg-card)', borderRadius: '10px', marginBottom: '20px' }}>
                            <h5 style={{ marginBottom: '15px' }}>Weekly Menu Assignment (Select 1-3 items per day)</h5>
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                <div key={day} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <strong style={{ textTransform: 'capitalize', width: '100px' }}>{day}:</strong>
                                    <select 
                                        className="form-control" 
                                        multiple 
                                        style={{ flex: 1, height: '80px', padding: '8px', overflowY: 'auto' }}
                                        value={newPlan.weeklyMenu[day]}
                                        onChange={e => {
                                            const options = [...e.target.options].filter(o => o.selected).map(o => o.value);
                                            setNewPlan({...newPlan, weeklyMenu: {...newPlan.weeklyMenu, [day]: options}});
                                        }}
                                    >
                                        {menuItems.map(item => (
                                            <option key={item._id} value={item._id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <button type="submit" className="btn btn-secondary">Save Plan</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {plans.map(plan => (
                    <div key={plan._id} style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--secondary-color)' }}>{plan.name}</h4>
                            <span className="status-badge status-active">{plan.type}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{plan.description}</p>
                        <h3 style={{ margin: '15px 0', color: 'var(--primary-color)' }}>₹{plan.price}</h3>
                        <p style={{ fontSize: '0.85rem' }}><strong>Meal:</strong> {plan.mealType}</p>
                    </div>
                ))}
                {plans.length === 0 && !isCreating && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <PackagePlus size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
                        <p>No subscription plans created yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChefPlans;
