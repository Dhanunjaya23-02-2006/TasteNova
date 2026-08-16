import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import { Plus, Trash2, PackagePlus, Edit } from 'lucide-react';

const ChefPlans = () => {
    const { user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingPlanId 
                ? `${API_URL}/subscriptions/plans/${editingPlanId}`
                : `${API_URL}/subscriptions/plans`;
            
            const method = editingPlanId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(newPlan)
            });
            if (res.ok) {
                toast.success(editingPlanId ? 'Plan updated!' : 'Plan created!');
                setIsCreating(false);
                setEditingPlanId(null);
                setNewPlan({
                    name: '', description: '', type: 'Weekly', mealType: 'Lunch', price: '',
                    weeklyMenu: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
                });
                fetchPlans();
            } else {
                toast.error(`Failed to ${editingPlanId ? 'update' : 'create'} plan`);
            }
        } catch (error) {
            toast.error(`Error ${editingPlanId ? 'updating' : 'creating'} plan`);
        }
    };

    const handleEdit = (plan) => {
        setNewPlan({
            name: plan.name,
            description: plan.description,
            type: plan.type,
            mealType: plan.mealType,
            price: plan.price,
            weeklyMenu: {
                monday: plan.weeklyMenu?.monday || [],
                tuesday: plan.weeklyMenu?.tuesday || [],
                wednesday: plan.weeklyMenu?.wednesday || [],
                thursday: plan.weeklyMenu?.thursday || [],
                friday: plan.weeklyMenu?.friday || [],
                saturday: plan.weeklyMenu?.saturday || [],
                sunday: plan.weeklyMenu?.sunday || []
            }
        });
        setEditingPlanId(plan._id);
        setIsCreating(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this plan?')) return;
        try {
            const res = await fetch(`${API_URL}/subscriptions/plans/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                toast.success('Plan deleted!');
                fetchPlans();
            } else {
                toast.error('Failed to delete plan');
            }
        } catch (error) {
            toast.error('Error deleting plan');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'var(--primary-color)', margin: 0 }}>Subscription Plans</h3>
                <button className="btn btn-primary" onClick={() => {
                    setIsCreating(!isCreating);
                    if (isCreating) {
                        setEditingPlanId(null);
                        setNewPlan({
                            name: '', description: '', type: 'Weekly', mealType: 'Lunch', price: '',
                            weeklyMenu: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
                        });
                    }
                }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isCreating ? 'Cancel' : <><Plus size={18} /> Create Plan</>}
                </button>
            </div>

            {isCreating && (
                <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                    <h4>{editingPlanId ? 'Edit Plan' : 'Create New Plan'}</h4>
                    <form onSubmit={handleSubmit}>
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
                                <div key={day} style={{ marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    <strong style={{ textTransform: 'capitalize', display: 'block', marginBottom: '8px' }}>{day}:</strong>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {menuItems.map(item => (
                                            <label key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'var(--bg-body)', padding: '5px 10px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                                <input 
                                                    type="checkbox"
                                                    checked={newPlan.weeklyMenu[day]?.includes(item._id) || false}
                                                    onChange={e => {
                                                        const current = newPlan.weeklyMenu[day] || [];
                                                        let updated;
                                                        if (e.target.checked) {
                                                            if (current.length >= 3) {
                                                                toast.error('Maximum 3 items allowed per day');
                                                                return;
                                                            }
                                                            updated = [...current, item._id];
                                                        } else {
                                                            updated = current.filter(id => id !== item._id);
                                                        }
                                                        setNewPlan({...newPlan, weeklyMenu: {...newPlan.weeklyMenu, [day]: updated}});
                                                    }}
                                                />
                                                {item.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="submit" className="btn btn-secondary">{editingPlanId ? 'Update Plan' : 'Save Plan'}</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {plans.map(plan => (
                    <div key={plan._id} style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '5px' }}>
                            <button className="btn btn-sm" onClick={() => handleEdit(plan)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }} title="Edit Plan"><Edit size={16} /></button>
                            <button className="btn btn-sm" onClick={() => handleDelete(plan._id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '5px' }} title="Delete Plan"><Trash2 size={16} /></button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '50px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--secondary-color)' }}>{plan.name}</h4>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
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
