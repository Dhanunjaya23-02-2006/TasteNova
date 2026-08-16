import React, { useState, useEffect, useContext } from 'react';
import { Lock, Plus, Edit2, Trash2, X, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const AVAILABLE_PERMISSIONS = [
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'manage_chefs', label: 'Manage Chefs' },
    { id: 'manage_orders', label: 'Manage Orders' },
    { id: 'manage_support', label: 'Manage Support' },
    { id: 'manage_finance', label: 'Manage Finance' },
    { id: 'manage_marketing', label: 'Manage Marketing' },
    { id: 'manage_roles', label: 'Manage Roles' },
    { id: 'manage_cities', label: 'Manage Cities' },
    { id: 'manage_settings', label: 'Manage Settings' }
];

const SuperadminRoles = () => {
    const { user } = useContext(AuthContext);
    const [roles, setRoles] = useState([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });

    const fetchRoles = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/roles`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setRoles(await res.json());
        } catch(e) { console.error(e); }
    };

    useEffect(() => { if(user) fetchRoles(); }, [user]);

    const openModal = (role = null) => {
        if(role) {
            setEditingRole(role);
            setFormData({ name: role.name, description: role.description, permissions: role.permissions || [] });
        } else {
            setEditingRole(null);
            setFormData({ name: '', description: '', permissions: [] });
        }
        setIsModalOpen(true);
    };

    const togglePermission = (permId) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingRole ? 'PUT' : 'POST';
            const url = editingRole ? `${API_URL}/superadmin/roles/${editingRole._id}` : `${API_URL}/superadmin/roles`;
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });

            if(res.ok) {
                toast.success(editingRole ? 'Role updated' : 'Role created');
                setIsModalOpen(false);
                fetchRoles();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Error saving role');
            }
        } catch(e) { toast.error('Error saving role'); }
    };

    const confirmDelete = (id) => {
        setRoleToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if(!roleToDelete) return;
        try {
            const res = await fetch(`${API_URL}/superadmin/roles/${roleToDelete}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
            if(res.ok) {
                toast.success('Role deleted');
                setIsDeleteModalOpen(false);
                setRoleToDelete(null);
                fetchRoles();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Error deleting role');
            }
        } catch(e) { toast.error('Error deleting role'); }
    };

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Role-Based Access Control (RBAC)</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage custom roles and permissions for sub-admins.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => openModal()}>
                        <Plus size={16} /> Create Role
                    </button>
                </div>
            </div>

            <div className="sa-card" style={{ padding: 0 }}>
                <table className="sa-table">
                    <thead>
                        <tr>
                            <th>Role Name</th>
                            <th>Description</th>
                            <th>Assigned Users</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(role => (
                            <tr key={role._id}>
                                <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {role.type === 'System' && <Lock size={14} style={{ color: 'var(--text-muted)' }} />}
                                    {role.name}
                                </td>
                                <td>{role.description}</td>
                                <td>{role.assignedUsersCount} Users</td>
                                <td>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: role.type === 'System' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(39, 174, 96, 0.1)', color: role.type === 'System' ? '#3498db' : '#27ae60' }}>
                                        {role.type}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            style={{ background: 'rgba(52, 152, 219, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: role.type === 'System' ? 'not-allowed' : 'pointer', opacity: role.type === 'System' ? 0.5 : 1 }} 
                                            title="Edit Role"
                                            disabled={role.type === 'System'}
                                            onClick={() => openModal(role)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            style={{ background: 'rgba(231, 76, 60, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: role.type === 'System' ? 'not-allowed' : 'pointer', opacity: role.type === 'System' ? 0.5 : 1 }} 
                                            title="Delete Role"
                                            disabled={role.type === 'System'}
                                            onClick={() => confirmDelete(role._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {roles.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No roles found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="sa-card" style={{ width: '100%', maxWidth: '600px', padding: '24px', position: 'relative' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsModalOpen(false)} />
                        <h3 style={{ margin: '0 0 20px 0' }}>{editingRole ? 'Edit Role' : 'Create Role'}</h3>
                        
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Role Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    placeholder="e.g. Marketing Manager"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    placeholder="Brief description of what this role does"
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '0.9rem' }}>Permissions</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
                                    {AVAILABLE_PERMISSIONS.map(perm => (
                                        <div 
                                            key={perm.id} 
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                            onClick={() => togglePermission(perm.id)}
                                        >
                                            {formData.permissions.includes(perm.id) 
                                                ? <CheckSquare size={18} color="var(--primary)" /> 
                                                : <Square size={18} color="var(--text-muted)" />
                                            }
                                            <span style={{ fontSize: '0.9rem', color: formData.permissions.includes(perm.id) ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: formData.permissions.includes(perm.id) ? 600 : 400 }}>
                                                {perm.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                                {editingRole ? 'Save Changes' : 'Create Role'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="sa-card" style={{ width: '100%', maxWidth: '350px', padding: '24px', position: 'relative', textAlign: 'center' }}>
                        <X size={20} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsDeleteModalOpen(false)} />
                        <h3 style={{ margin: '0 0 12px 0', color: 'var(--error)' }}>Delete Role</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Are you sure you want to delete this custom role?</p>
                        
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ background: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperadminRoles;
