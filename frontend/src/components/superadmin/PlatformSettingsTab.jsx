import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Globe, Truck, CheckCircle, Plus, Edit2, Trash2, MapPin } from 'lucide-react';

export const PlatformSettingsTab = ({ user }) => {
    const [activeSubTab, setActiveSubTab] = useState('delivery');
    const [deliverySettings, setDeliverySettings] = useState({ baseDeliveryFee: 40, perKmFee: 10, freeDeliveryThreshold: 500 });
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [categoryForm, setCategoryForm] = useState({ name: '', type: 'Category', icon: '🍲', displayOrder: 0 });
    const [editCityModal, setEditCityModal] = useState(null);
    const [cityData, setCityData] = useState({ name: '', state: '', deliveryRadius: 10 });

    useEffect(() => {
        fetchSettings();
        fetchCategories();
        fetchCities();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/platform/delivery-settings`);
            if (res.ok) setDeliverySettings(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/platform/categories`);
            if (res.ok) setCategories(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchCities = async () => {
        try {
            const res = await fetch(`${API_URL}/cities?all=true`);
            if (res.ok) setCities(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleSaveDelivery = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/platform/delivery-settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(deliverySettings)
            });
            if (res.ok) toast.success('Delivery settings updated');
            else toast.error('Failed to update delivery settings');
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/platform/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(categoryForm)
            });
            if (res.ok) {
                toast.success('Category created');
                setCategoryForm({ name: '', type: 'Category', icon: '🍲', displayOrder: 0 });
                fetchCategories();
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const res = await fetch(`${API_URL}/platform/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                toast.success('Category deleted');
                fetchCategories();
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const handleAddCity = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/cities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(cityData)
            });
            if (res.ok) {
                toast.success('City Added!');
                fetchCities();
                setCityData({ name: '', state: '', deliveryRadius: 10 });
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to add city');
            }
        } catch (error) { toast.error('Error adding city'); }
    };

    const handleDeleteCity = async (id) => {
        if (!window.confirm('Are you sure you want to delete this city?')) return;
        try {
            const res = await fetch(`${API_URL}/cities/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                toast.success('City deleted');
                fetchCities();
            } else {
                toast.error('Failed to delete city');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '2rem', margin: 0 }}>Platform Settings</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`btn ${activeSubTab === 'delivery' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSubTab('delivery')} style={{ padding: '8px 16px', borderRadius: '12px' }}>Global Delivery</button>
                    <button className={`btn ${activeSubTab === 'categories' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSubTab('categories')} style={{ padding: '8px 16px', borderRadius: '12px' }}>Categories</button>
                    <button className={`btn ${activeSubTab === 'cities' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSubTab('cities')} style={{ padding: '8px 16px', borderRadius: '12px' }}>Cities Setup</button>
                </div>
            </div>

            {activeSubTab === 'delivery' && (
                <div className="glass-panel" style={{ padding: '30px', maxWidth: '600px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <Truck size={28} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Global Delivery Rates</h3>
                    </div>
                    <form onSubmit={handleSaveDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group">
                            <label>Base Delivery Fee (₹)</label>
                            <input type="number" className="form-control" value={deliverySettings.baseDeliveryFee} onChange={e => setDeliverySettings({...deliverySettings, baseDeliveryFee: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Per Km Extra Fee (₹)</label>
                            <input type="number" className="form-control" value={deliverySettings.perKmFee} onChange={e => setDeliverySettings({...deliverySettings, perKmFee: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Free Delivery Threshold (₹)</label>
                            <input type="number" className="form-control" value={deliverySettings.freeDeliveryThreshold} onChange={e => setDeliverySettings({...deliverySettings, freeDeliveryThreshold: e.target.value})} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <CheckCircle size={20} /> Save Delivery Settings
                        </button>
                    </form>
                </div>
            )}

            {activeSubTab === 'categories' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Add Category/Cuisine</h3>
                        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="input-group">
                                <label>Name</label>
                                <input type="text" className="form-control" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />
                            </div>
                            <div className="input-group">
                                <label>Type</label>
                                <select className="form-control" value={categoryForm.type} onChange={e => setCategoryForm({...categoryForm, type: e.target.value})}>
                                    <option value="Category">Food Category</option>
                                    <option value="Cuisine">Cuisine</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Emoji Icon</label>
                                <input type="text" className="form-control" value={categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})} required />
                            </div>
                            <div className="input-group">
                                <label>Display Order</label>
                                <input type="number" className="form-control" value={categoryForm.displayOrder} onChange={e => setCategoryForm({...categoryForm, displayOrder: e.target.value})} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '12px', borderRadius: '12px' }}>Add New</button>
                        </form>
                    </div>

                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Active Categories</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                            {categories.map(cat => (
                                <div key={cat._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative' }}>
                                    <button onClick={() => handleDeleteCategory(cat._id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                    <div style={{ fontSize: '2rem' }}>{cat.icon}</div>
                                    <span style={{ fontWeight: 'bold' }}>{cat.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'cities' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <MapPin size={28} color="var(--primary)" />
                            <h3 style={{ margin: 0 }}>Serviceable Cities Overrides</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Manage per-city delivery settings. If a city is missing fields, it falls back to the Global Delivery settings.</p>
                        
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ padding: '15px' }}>City</th>
                                        <th style={{ padding: '15px' }}>State</th>
                                        <th style={{ padding: '15px' }}>Base Fee</th>
                                        <th style={{ padding: '15px' }}>Per Km</th>
                                        <th style={{ padding: '15px' }}>Status</th>
                                        <th style={{ padding: '15px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cities.map(city => (
                                        <tr key={city._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '15px', fontWeight: 'bold' }}>{city.name}</td>
                                            <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{city.state}</td>
                                            <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{city.baseDeliveryFee ? `₹${city.baseDeliveryFee}` : 'Global'}</td>
                                            <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{city.perKmFee ? `₹${city.perKmFee}` : 'Global'}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', background: city.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: city.isActive ? 'var(--success)' : 'var(--error)' }}>
                                                    {city.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', display: 'flex', gap: '5px' }}>
                                                <button onClick={() => setEditCityModal(city)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}>Edit</button>
                                                <button onClick={() => handleDeleteCity(city._id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.2)' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cities.length === 0 && (
                                        <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No cities found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '30px', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Plus size={20} color="var(--primary)" /> Add New City
                        </h3>
                        <form onSubmit={handleAddCity} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="input-group">
                                <label>City Name</label>
                                <input type="text" className="form-control" value={cityData.name} onChange={e => setCityData({...cityData, name: e.target.value})} required placeholder="e.g., Mumbai" />
                            </div>
                            <div className="input-group">
                                <label>State / Region</label>
                                <input type="text" className="form-control" value={cityData.state} onChange={e => setCityData({...cityData, state: e.target.value})} required placeholder="e.g., Maharashtra" />
                            </div>
                            <div className="input-group">
                                <label>Delivery Radius (km)</label>
                                <input type="number" className="form-control" value={cityData.deliveryRadius} onChange={e => setCityData({...cityData, deliveryRadius: Number(e.target.value)})} min="1" max="50" required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '12px', borderRadius: '12px', marginTop: '10px' }}>
                                Add City
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {editCityModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ padding: '30px', width: '400px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Edit City: {editCityModal.name}</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const res = await fetch(`${API_URL}/cities/${editCityModal._id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                    body: JSON.stringify({
                                        baseDeliveryFee: Number(editCityModal.baseDeliveryFee),
                                        perKmFee: Number(editCityModal.perKmFee),
                                        isActive: editCityModal.isActive
                                    })
                                });
                                if (res.ok) {
                                    toast.success('City updated successfully');
                                    setEditCityModal(null);
                                    fetchCities();
                                } else {
                                    toast.error('Failed to update city');
                                }
                            } catch(err) {
                                toast.error('Network error');
                            }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="input-group">
                                <label>Base Fee (₹)</label>
                                <input type="number" className="form-control" value={editCityModal.baseDeliveryFee || ''} onChange={e => setEditCityModal({...editCityModal, baseDeliveryFee: e.target.value})} required />
                            </div>
                            <div className="input-group">
                                <label>Per Km Fee (₹)</label>
                                <input type="number" className="form-control" value={editCityModal.perKmFee || ''} onChange={e => setEditCityModal({...editCityModal, perKmFee: e.target.value})} required />
                            </div>
                            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                <input type="checkbox" checked={editCityModal.isActive} onChange={e => setEditCityModal({...editCityModal, isActive: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                <label style={{ margin: 0, cursor: 'pointer' }} onClick={() => setEditCityModal({...editCityModal, isActive: !editCityModal.isActive})}>Is Active</label>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setEditCityModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
