import React, { useState, useEffect, useContext } from 'react';
import { Search, Map, PlusCircle, Edit3, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const AdminZones = () => {
    const { user } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [formData, setFormData] = useState({ name: '', deliveryRadius: 6, status: 'Active' });

    const fetchZones = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/zones`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setZones(await res.json());
        } catch (err) { toast.error('Error loading zones'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchZones(); }, [user.token]);

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const url = editingZone ? `${API_URL}/admin/zones/${editingZone._id}` : `${API_URL}/admin/zones`;
            const method = editingZone ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success(`Zone ${editingZone ? 'updated' : 'created'}`);
                setIsModalOpen(false);
                setEditingZone(null);
                setFormData({ name: '', deliveryRadius: 6, status: 'Active' });
                fetchZones();
            } else { toast.error('Failed to save zone'); }
        } catch (err) { toast.error('Error saving zone'); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const res = await fetch(`${API_URL}/admin/zones/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) { toast.success('Zone deleted'); fetchZones(); }
            else { toast.error('Failed to delete zone'); }
        } catch (err) { toast.error('Error deleting zone'); }
    };

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1>Zonal Operations</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Manage delivery zones and assigned areas within your city.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setEditingZone(null); setFormData({ name: '', deliveryRadius: 6, status: 'Active' }); setIsModalOpen(true); }}>
                        <PlusCircle size={16} /> Create Zone
                    </button>
                </div>
            </div>

            <div className="sa-card">
                <div className="sa-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>All Zones</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="sa-search" style={{ paddingLeft: '32px', width: '300px' }} type="text" placeholder="Search zones..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="sa-table-wrap">
                    {loading ? <div className="sa-empty">Loading Zones...</div> : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Zone Name</th>
                                <th>Delivery Radius</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zones.filter(z => z.name.toLowerCase().includes(search.toLowerCase())).map(z => (
                                <tr key={z._id}>
                                    <td style={{ fontWeight: 600 }}>{z.name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{z.deliveryRadius} km</td>
                                    <td>
                                        <span className={`sa-badge ${z.status === 'Active' ? 'sa-badge-green' : 'sa-badge-red'}`}>{z.status}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{ background: 'rgba(52, 152, 219, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => { setEditingZone(z); setFormData({ name: z.name, deliveryRadius: z.deliveryRadius, status: z.status }); setIsModalOpen(true); }}>
                                                <Edit3 size={16} />
                                            </button>
                                            <button style={{ background: 'rgba(231, 76, 60, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => handleDelete(z._id, z.name)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {zones.length === 0 && (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No zones found. Click Create Zone to add one.</td></tr>
                            )}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="sa-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsModalOpen(false)} />
                        <h3 style={{ margin: '0 0 20px 0' }}>{editingZone ? 'Edit Zone' : 'Create Zone'}</h3>
                        
                        <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Zone Name</label>
                                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Kukatpally" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Delivery Radius (km)</label>
                                    <input type="number" className="form-control" value={formData.deliveryRadius} onChange={e => setFormData({...formData, deliveryRadius: parseInt(e.target.value)})} required min="1" max="50" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Status</label>
                                    <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                                {editingZone ? 'Save Changes' : 'Create Zone'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminZones;
