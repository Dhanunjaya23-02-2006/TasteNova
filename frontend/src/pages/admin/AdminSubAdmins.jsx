import React, { useState, useEffect, useContext } from 'react';
import { Search, UserPlus, Edit3, Trash2, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const AdminSubAdmins = () => {
    const { user } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [subAdmins, setSubAdmins] = useState([]);
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubAdmin, setEditingSubAdmin] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', assignedZones: [] });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, zonesRes] = await Promise.all([
                fetch(`${API_URL}/admin/subadmins`, { headers: { Authorization: `Bearer ${user.token}` } }),
                fetch(`${API_URL}/admin/zones`, { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            
            if (subRes.ok) setSubAdmins(await subRes.json());
            if (zonesRes.ok) setZones(await zonesRes.json());
        } catch (err) { toast.error('Error loading data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [user.token]);

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const url = editingSubAdmin ? `${API_URL}/admin/subadmins/${editingSubAdmin._id}` : `${API_URL}/admin/subadmins`;
            const method = editingSubAdmin ? 'PUT' : 'POST';
            
            // For updates, we don't send password if it's empty
            const payload = { ...formData };
            if (editingSubAdmin && !payload.password) delete payload.password;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success(`Sub-Admin ${editingSubAdmin ? 'updated' : 'created'}`);
                setIsModalOpen(false);
                setEditingSubAdmin(null);
                setFormData({ name: '', email: '', password: '', phone: '', assignedZones: [] });
                fetchData();
            } else { 
                const errData = await res.json();
                toast.error(errData.message || 'Failed to save Sub-Admin'); 
            }
        } catch (err) { toast.error('Error saving Sub-Admin'); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const res = await fetch(`${API_URL}/admin/subadmins/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) { toast.success('Sub-Admin deleted'); fetchData(); }
            else { toast.error('Failed to delete Sub-Admin'); }
        } catch (err) { toast.error('Error deleting Sub-Admin'); }
    };

    const handleZoneToggle = (zoneId) => {
        setFormData(prev => ({
            ...prev,
            assignedZones: prev.assignedZones.includes(zoneId)
                ? prev.assignedZones.filter(id => id !== zoneId)
                : [...prev.assignedZones, zoneId]
        }));
    };

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1>Sub-Admin Management</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Create and assign Zonal Sub-Admins to specific operational areas.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setEditingSubAdmin(null); setFormData({ name: '', email: '', password: '', phone: '', assignedZones: [] }); setIsModalOpen(true); }}>
                        <UserPlus size={16} /> Add Sub-Admin
                    </button>
                </div>
            </div>

            <div className="sa-card">
                <div className="sa-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Active Sub-Admins</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="sa-search" style={{ paddingLeft: '32px', width: '300px' }} type="text" placeholder="Search sub-admins..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="sa-table-wrap">
                    {loading ? <div className="sa-empty">Loading Sub-Admins...</div> : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Assigned Zones</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subAdmins.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())).map(s => (
                                <tr key={s._id}>
                                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>{s.email}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.phone}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {s.assignedZones && s.assignedZones.length > 0 ? (
                                                s.assignedZones.map(z => (
                                                    <span key={z._id} style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {z.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No zones assigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`sa-badge ${s.status === 'active' ? 'sa-badge-green' : 'sa-badge-red'}`}>{s.status}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{ background: 'rgba(52, 152, 219, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => { setEditingSubAdmin(s); setFormData({ name: s.name, email: s.email, password: '', phone: s.phone, assignedZones: s.assignedZones.map(z => z._id) }); setIsModalOpen(true); }}>
                                                <Edit3 size={16} />
                                            </button>
                                            <button style={{ background: 'rgba(231, 76, 60, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => handleDelete(s._id, s.name)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {subAdmins.length === 0 && (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No Sub-Admins found. Click Add Sub-Admin to create one.</td></tr>
                            )}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="sa-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsModalOpen(false)} />
                        <h3 style={{ margin: '0 0 20px 0' }}>{editingSubAdmin ? 'Edit Sub-Admin' : 'Create Sub-Admin'}</h3>
                        
                        <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
                                    <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Phone</label>
                                    <input type="tel" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Email</label>
                                    <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Password {editingSubAdmin && '(Leave blank to keep)'}</label>
                                    <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingSubAdmin} />
                                </div>
                            </div>

                            <div style={{ marginTop: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                    Assign Zonal Access
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {zones.length === 0 ? (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', gridColumn: 'span 2' }}>No zones exist in your region. Create a zone first.</div>
                                    ) : (
                                        zones.map(z => (
                                            <label key={z._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: formData.assignedZones.includes(z._id) ? 'rgba(252, 128, 25, 0.1)' : 'var(--bg-color)', padding: '10px', borderRadius: '8px', border: `1px solid ${formData.assignedZones.includes(z._id) ? 'var(--primary)' : 'var(--border-color)'}` }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.assignedZones.includes(z._id)} 
                                                    onChange={() => handleZoneToggle(z._id)}
                                                    style={{ display: 'none' }}
                                                />
                                                <MapPin size={16} color={formData.assignedZones.includes(z._id) ? 'var(--primary)' : 'var(--text-muted)'} />
                                                <span style={{ fontWeight: 500, fontSize: '0.9rem', color: formData.assignedZones.includes(z._id) ? 'var(--primary)' : 'inherit' }}>{z.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}>
                                {editingSubAdmin ? 'Save Changes' : 'Create Sub-Admin'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSubAdmins;
