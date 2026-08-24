import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Plus, Edit3, Trash2, Search, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MenuTab = () => {
    const { user } = useContext(AuthContext);
    const [menuItems, setMenuItems] = useState([]);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Existing form state (kept for functionality, though we'll hide it behind a modal toggle in a real app)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [menuData, setMenuData] = useState({ name: '', description: '', price: '', offerPrice: '', ingredientCost: '', image: '', available: true });
    const [editingItemId, setEditingItemId] = useState(null);

    useEffect(() => {
        if (user) fetchMenu();
    }, [user]);

    const fetchMenu = async () => {
        try {
            const res = await fetch(`${API_URL}/menu?chef=${user._id}`);
            if (res.ok) setMenuItems(await res.json());
        } catch (error) { console.error('Error fetching menu', error); }
    };

    const handleSaveMenu = async (e) => {
        e.preventDefault();
        try {
            const method = editingItemId ? 'PUT' : 'POST';
            const url = editingItemId ? `${API_URL}/menu/${editingItemId}` : `${API_URL}/menu`;
            const payload = { ...menuData, chef: user._id };
            
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                toast.success(editingItemId ? 'Menu item updated' : 'Menu item added');
                fetchMenu();
                setIsFormOpen(false);
                setMenuData({ name: '', description: '', price: '', offerPrice: '', ingredientCost: '', image: '', available: true });
                setEditingItemId(null);
            } else {
                toast.error('Failed to save menu item');
            }
        } catch (error) { toast.error('An error occurred'); }
    };

    const [itemToDelete, setItemToDelete] = useState(null);

    const executeDelete = async (id) => {
        try {
            const res = await fetch(`${API_URL}/menu/${id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                toast.success('Item deleted successfully');
                fetchMenu();
                setItemToDelete(null);
            } else {
                toast.error('Failed to delete item');
            }
        } catch (error) { toast.error('An error occurred while deleting'); }
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
    };

    const handleDuplicate = async (item) => {
        const payload = { name: `${item.name} (Copy)`, description: item.description, price: item.price, offerPrice: item.offerPrice, ingredientCost: item.ingredientCost, image: item.image, available: item.available, chef: user._id };
        try {
            const res = await fetch(`${API_URL}/menu`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success('Dish duplicated');
                fetchMenu();
            } else {
                toast.error('Failed to duplicate item');
            }
        } catch (error) { toast.error('An error occurred'); }
    };

    const openEdit = (item) => {
        setMenuData({ name: item.name, description: item.description, price: item.price, offerPrice: item.offerPrice || '', ingredientCost: item.ingredientCost || '', image: item.image || '', available: item.available });
        setEditingItemId(item._id);
        setIsFormOpen(true);
    };

    const activeCount = menuItems.filter(m => m.available).length;
    const inactiveCount = menuItems.length - activeCount;

    const filteredItems = menuItems.filter(m => {
        if (filter === 'Active' && !m.available) return false;
        if (filter === 'Inactive' && m.available) return false;
        if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const tabStyle = (isActive) => ({
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        background: isActive ? 'rgba(39, 174, 96, 0.08)' : 'transparent',
        color: isActive ? '#0F3F26' : 'var(--text-muted)',
        border: 'none',
        transition: 'all 0.2s ease'
    });

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Menu Management</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Add, edit or remove dishes from your menu.</p>
            </div>

            {/* Controls Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', background: '#fff', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <button style={tabStyle(filter === 'All')} onClick={() => setFilter('All')}>All Dishes ({menuItems.length})</button>
                    <button style={tabStyle(filter === 'Active')} onClick={() => setFilter('Active')}>Active ({activeCount})</button>
                    <button style={tabStyle(filter === 'Inactive')} onClick={() => setFilter('Inactive')}>Inactive ({inactiveCount})</button>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Search dishes..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--border-subtle)', outline: 'none', width: '200px' }}
                        />
                    </div>
                    <button onClick={() => { setEditingItemId(null); setMenuData({ name: '', description: '', price: '', offerPrice: '', ingredientCost: '', image: '', available: true }); setIsFormOpen(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}>
                        <Plus size={16} /> Add New Dish
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Dish</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Category</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Price</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Offer Price</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                            <th style={{ textAlign: 'center', padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No dishes found.</td>
                            </tr>
                        ) : (
                            filteredItems.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                                    <td data-label="Dish" style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#eee', overflow: 'hidden' }}>
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                        <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${item._id}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="dish" />
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{ fontWeight: 700, color: '#0F3F26', fontSize: '0.95rem' }}>{item.name}</span>
                                        </div>
                                    </td>
                                    <td data-label="Category" style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                        {/* Mock category if undefined */}
                                        {item.category || (item.name.toLowerCase().includes('biryani') ? 'Biryani' : item.name.toLowerCase().includes('thali') ? 'Thali' : 'Main Course')}
                                    </td>
                                    <td data-label="Price" style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        ₹{item.price}
                                    </td>
                                    <td data-label="Offer Price" style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {item.offerPrice ? `₹${item.offerPrice}` : '-'}
                                    </td>
                                    <td data-label="Status" style={{ padding: '16px 24px' }}>
                                        <span style={{ 
                                            color: item.available ? '#27ae60' : '#e74c3c', 
                                            fontWeight: 700, 
                                            fontSize: '0.85rem' 
                                        }}>
                                            {item.available ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td data-label="Actions" style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                            <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}>
                                                <Trash2 size={16} />
                                            </button>
                                            <button onClick={() => handleDuplicate(item)} title="Duplicate Dish" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {/* Pagination footer */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', background: '#F8F9FA' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {filteredItems.length > 0 ? 1 : 0} to {filteredItems.length} of {menuItems.length} dishes</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>&lt;</button>
                        <span style={{ padding: '4px 10px', border: '1px solid #27ae60', color: '#27ae60', borderRadius: '4px', fontWeight: 700 }}>1</span>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>&gt;</button>
                    </div>
                </div>
            </div>

            {/* Modal for adding/editing (Simple inline overlay for now) */}
            {isFormOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#0F3F26' }}>{editingItemId ? 'Edit Dish' : 'Add New Dish'}</h2>
                        <form onSubmit={handleSaveMenu} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Dish Name</label>
                                <input type="text" className="form-control" required value={menuData.name} onChange={e => setMenuData({...menuData, name: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Price (₹)</label>
                                    <input type="number" className="form-control" required value={menuData.price} onChange={e => setMenuData({...menuData, price: e.target.value})} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Offer Price (₹)</label>
                                    <input type="number" className="form-control" value={menuData.offerPrice} onChange={e => setMenuData({...menuData, offerPrice: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Image URL</label>
                                <input type="text" className="form-control" value={menuData.image} onChange={e => setMenuData({...menuData, image: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                <input type="checkbox" id="available" checked={menuData.available} onChange={e => setMenuData({...menuData, available: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                                <label htmlFor="available" style={{ fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}>Available (Active)</label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="btn" style={{ background: '#eee', color: 'var(--text-main)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Dish</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', color: '#0F3F26' }}>Delete Dish</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Are you sure you want to delete this dish? This action cannot be undone.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setItemToDelete(null)} className="btn" style={{ background: '#eee', color: 'var(--text-main)' }}>Cancel</button>
                            <button onClick={() => executeDelete(itemToDelete)} className="btn btn-primary" style={{ background: '#e74c3c', border: 'none' }}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuTab;
