import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, ShieldAlert, Plus, X } from 'lucide-react';
import { API_URL } from '../../config';

const SuperadminSubAdmins = () => {
    const { user } = useContext(AuthContext);
    const [subadmins, setSubadmins] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '',
        role: 'subadmin', assignedCities: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [saRes, citiesRes] = await Promise.all([
                fetch(`${API_URL}/superadmin/subadmins`, { headers: { Authorization: `Bearer ${user.token}` } }),
                fetch(`${API_URL}/superadmin/cities`, { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            if (saRes.ok) setSubadmins(await saRes.json());
            if (citiesRes.ok) setCities(await citiesRes.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const updateAdmin = async (id, field, value) => {
        try {
            const res = await fetch(`${API_URL}/superadmin/subadmins/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ [field]: value })
            });
            if (res.ok) { toast.success('Updated'); fetchData(); }
            else { toast.error('Failed'); }
        } catch (e) { toast.error('Error'); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/superadmin/subadmins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });
            if(res.ok) {
                toast.success('Sub-Admin Created');
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', phone: '', role: 'subadmin', assignedCities: [] });
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Error creating sub-admin');
            }
        } catch(e) { toast.error('Error creating sub-admin'); }
    };

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Regional Admins & Sub-Admins</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage multi-city operators and roles</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} /> Add Sub-Admin
                    </button>
                </div>
            </div>

            {loading ? <div className="sa-empty">Loading...</div> : (
                <div className="sa-card" style={{ padding: 0 }}>
                    <table className="sa-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Assigned Cities (Zones)</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {subadmins.map(s => (
                                <tr key={s._id}>
                                    <td style={{ fontWeight: 600 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {s.role === 'admin' ? <ShieldAlert size={16} color="var(--accent)" /> : <Shield size={16} color="var(--primary)" />}
                                            {s.name}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                                    <td>
                                        <select 
                                            className="form-control" style={{ padding: '4px', fontSize: '0.85rem' }} 
                                            value={s.role} 
                                            onChange={(e) => updateAdmin(s._id, 'role', e.target.value)}
                                        >
                                            <option value="subadmin">Sub-Admin (Zonal)</option>
                                            <option value="admin">Admin (Regional)</option>
                                        </select>
                                    </td>
                                    <td style={{ position: 'relative' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                            {s.assignedCities?.length > 0 ? s.assignedCities.map(c => (
                                                <span key={c._id} className="sa-badge" style={{ background: 'rgba(252, 128, 25, 0.1)', color: 'var(--primary)' }}>
                                                    {c.name}
                                                </span>
                                            )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>}
                                        </div>
                                        <div className="custom-multiselect-dropdown">
                                            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={(e) => {
                                                const dropdown = e.currentTarget.nextElementSibling;
                                                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                                            }}>Edit Cities</button>
                                            <div style={{ display: 'none', position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '150px' }}>
                                                {cities.map(c => (
                                                    <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '4px', cursor: 'pointer' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={(s.assignedCities || []).some(assigned => assigned._id === c._id)}
                                                            onChange={(e) => {
                                                                const currentIds = (s.assignedCities || []).map(a => a._id);
                                                                const newIds = e.target.checked ? [...currentIds, c._id] : currentIds.filter(id => id !== c._id);
                                                                updateAdmin(s._id, 'assignedCities', newIds);
                                                            }}
                                                        />
                                                        {c.name}
                                                    </label>
                                                ))}
                                                <button className="btn btn-primary" style={{ width: '100%', padding: '4px', fontSize: '0.8rem', marginTop: '8px' }} onClick={(e) => e.currentTarget.parentElement.style.display = 'none'}>Done</button>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`sa-badge ${s.status === 'active' ? 'sa-badge-green' : 'sa-badge-red'}`}>{s.status}</span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ padding: '3px 10px', fontSize: '0.75rem', color: s.status === 'active' ? 'var(--error)' : 'var(--success)' }}
                                            onClick={() => updateAdmin(s._id, 'status', s.status === 'active' ? 'suspended' : 'active')}
                                        >
                                            {s.status === 'active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="sa-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsModalOpen(false)} />
                        <h3 style={{ margin: '0 0 20px 0' }}>Create Sub-Admin</h3>
                        
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
                                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Email</label>
                                    <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Phone</label>
                                    <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Temporary Password</label>
                                <input type="text" className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                            </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Role</label>
                                    <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                        <option value="subadmin">Sub-Admin (Zonal)</option>
                                        <option value="admin">Admin (Regional)</option>
                                    </select>
                                </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperadminSubAdmins;
