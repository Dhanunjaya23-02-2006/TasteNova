import React, { useState, useEffect, useContext } from 'react';
import { Search, GripVertical, Image as ImageIcon, PlusCircle, Edit3, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminCategories = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: '🥗', displayOrder: 0, isActive: true });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/superadmin/categories`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setCategories(await res.json());
        } catch (err) { toast.error('Error loading categories'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, [user.token]);

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const url = editingCategory ? `${API_URL}/superadmin/categories/${editingCategory._id}` : `${API_URL}/superadmin/categories`;
            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success(`Category ${editingCategory ? 'updated' : 'created'}`);
                setIsModalOpen(false);
                setEditingCategory(null);
                setFormData({ name: '', icon: '🥗', displayOrder: 0, isActive: true });
                fetchCategories();
            } else { toast.error('Failed to save category'); }
        } catch (err) { toast.error('Error saving category'); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const res = await fetch(`${API_URL}/superadmin/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) { toast.success('Category deleted'); fetchCategories(); }
            else { toast.error('Failed to delete category'); }
        } catch (err) { toast.error('Error deleting category'); }
    };

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Menu Categories</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage the master list of cuisine categories available for chefs to use.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setEditingCategory(null); setFormData({ name: '', icon: '🥗', displayOrder: 0, isActive: true }); setIsModalOpen(true); }}>
                        <PlusCircle size={16} /> Add Category
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="sa-modal-title">All Categories</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="sa-search" style={{ paddingLeft: '32px', width: '250px' }} placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="sa-table-wrap">
                    {loading ? <div className="sa-empty">Loading Categories...</div> : (
                        <table className="sa-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th>Icon</th>
                                    <th>Category Name</th>
                                    <th>Sort Order</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
                                    <tr key={c._id}>
                                        <td style={{ color: 'var(--text-muted)', cursor: 'grab' }}>
                                            <GripVertical size={16} />
                                        </td>
                                        <td>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(252, 128, 25, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                {c.icon}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                                        <td style={{ fontWeight: 700, color: '#0F3F26' }}>{c.displayOrder}</td>
                                        <td>
                                            <span className={`sa-badge ${c.isActive ? 'sa-badge-green' : 'sa-badge-red'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button style={{ background: 'rgba(52, 152, 219, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => { setEditingCategory(c); setFormData({ name: c.name, icon: c.icon, displayOrder: c.displayOrder, isActive: c.isActive }); setIsModalOpen(true); }}>
                                                    <Edit3 size={16} />
                                                </button>
                                                <button style={{ background: 'rgba(231, 76, 60, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => handleDelete(c._id, c.name)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No categories found. Click Add Category to create one.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="sa-modal-card">
                        <X size={20} className="sa-modal-close" onClick={() => setIsModalOpen(false)} />
                        <h3 className="sa-modal-title">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>

                        <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="sa-form-label">Category Name</label>
                                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. North Indian" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="sa-form-label">Icon (Emoji)</label>
                                    <input type="text" className="form-control" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="sa-form-label">Sort Order</label>
                                    <input type="number" className="form-control" value={formData.displayOrder} onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })} required />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                    Active Status
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                                {editingCategory ? 'Save Changes' : 'Create Category'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperadminCategories;
