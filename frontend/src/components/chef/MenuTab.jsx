import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MenuTab = () => {
    const { user } = useContext(AuthContext);
    const [menuItems, setMenuItems] = useState([]);
    const [menuData, setMenuData] = useState({ name: '', description: '', price: '', offerPrice: '', ingredientCost: '', image: '', available: true });
    const [itemStatus, setItemStatus] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMenu();
        }
    }, [user]);

    const fetchMenu = async () => {
        try {
            const res = await fetch(`${API_URL}/menu?chef=${user._id}`);
            if (res.ok) setMenuItems(await res.json());
        } catch (error) { console.error('Error fetching menu', error); }
    };

    const handleSaveMenu = async (e) => {
        e.preventDefault();
        setItemStatus('Saving...');
        try {
            const url = editingItemId ? `${API_URL}/menu/${editingItemId}` : `${API_URL}/menu`;
            const method = editingItemId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(menuData)
            });
            if (res.ok) {
                toast.success(editingItemId ? 'Item updated!' : 'Item added successfully!');
                setMenuData({ name: '', description: '', price: '', offerPrice: '', ingredientCost: '', image: '', available: true });
                setEditingItemId(null);
                fetchMenu();
                setItemStatus('');
            } else { setItemStatus('Failed to save item'); }
        } catch (error) { setItemStatus('Error saving item'); }
    };

    const handleEditItem = (item) => {
        setEditingItemId(item._id);
        setMenuData({ name: item.name, description: item.description, price: item.price, offerPrice: item.offerPrice || '', ingredientCost: item.ingredientCost || '', image: item.image, available: item.available !== false });
        window.scrollTo(0, 0);
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setMenuData({ name: '', description: '', price: '', offerPrice: '', ingredientCost: '', image: '', available: true });
    };

    const handleDeleteItem = (id) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            deleteItem(id);
        }
    };

    const deleteItem = async (id) => {
        try {
            const res = await fetch(`${API_URL}/menu/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                toast.success('Item removed');
                fetchMenu();
            }
        } catch (error) { toast.error('Error deleting item'); }
    };

    return (
        <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-4"
            style={{ flexWrap: 'wrap' }}
        >
            <div className="glass-panel" style={{ flex: '1 1 400px', padding: '24px', height: 'fit-content', boxShadow: 'var(--shadow-floating)' }}>
                <h3 className="mb-4">{editingItemId ? 'Update Dish' : 'Add New Signature Dish'}</h3>
                {itemStatus && <p style={{ color: 'var(--primary-color)' }}>{itemStatus}</p>}
                <form onSubmit={handleSaveMenu}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Dish Name</label>
                        <input className="form-control" type="text" value={menuData.name} onChange={(e) => setMenuData({ ...menuData, name: e.target.value })} required placeholder="e.g. Butter Chicken Delight" />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Short Description</label>
                        <textarea className="form-control" rows="2" value={menuData.description} onChange={(e) => setMenuData({ ...menuData, description: e.target.value })} required />
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ marginBottom: '16px', flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Price (₹)</label>
                            <input className="form-control" type="number" value={menuData.price} onChange={(e) => setMenuData({ ...menuData, price: e.target.value })} required />
                        </div>
                        <div style={{ marginBottom: '16px', flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Offer Price</label>
                            <input className="form-control" type="number" value={menuData.offerPrice} onChange={(e) => setMenuData({ ...menuData, offerPrice: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: '16px', flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Ing. Cost (₹)</label>
                            <input className="form-control" type="number" value={menuData.ingredientCost} onChange={(e) => setMenuData({ ...menuData, ingredientCost: e.target.value })} required />
                        </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Image URL</label>
                        <input className="form-control" type="text" value={menuData.image} onChange={(e) => setMenuData({ ...menuData, image: e.target.value })} required />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                            {editingItemId ? <><Edit3 size={18} style={{ marginRight: '8px' }} /> Update</> : <><Plus size={18} style={{ marginRight: '8px' }} /> Publish Dish</>}
                        </button>
                        {editingItemId && <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} style={{ flex: 1 }}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="glass-panel" style={{ flex: '2 1 600px', padding: '24px', boxShadow: 'var(--shadow-floating)' }}>
                <div className="flex justify-between align-center mb-4">
                    <h3 style={{ margin: 0 }}>Current Menu</h3>
                    <span className="status-badge status-info">{menuItems.length} Items</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                    {menuItems.map(item => (
                        <motion.div 
                            layout
                            key={item._id} 
                            className="glass-panel animate-fade-up"
                            style={{ padding: '15px', boxShadow: 'var(--shadow-floating)' }}
                        >
                            <img loading="lazy" src={item.image} alt={item.name} style={{ width: '100%', height: '140px', borderRadius: '12px', objectFit: 'cover', marginBottom: '12px' }} />
                            <div className="flex justify-between align-center mb-2">
                                <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                <div className="flex align-center gap-1">
                                    {item.offerPrice && <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹{item.price}</span>}
                                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{item.offerPrice || item.price}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button className="btn btn-secondary" onClick={() => handleEditItem(item)} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>Edit</button>
                                <button className="btn btn-outline" onClick={() => handleDeleteItem(item._id)} style={{ flex: 1, padding: '8px', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'var(--error)' }}><Trash2 size={14} /></button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default MenuTab;
