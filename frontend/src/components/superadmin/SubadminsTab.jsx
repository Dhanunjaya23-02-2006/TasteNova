import React from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const SubadminsTab = ({ 
    managementData, 
    cities, 
    user,
    setShowAddSubadminModal, 
    showAddSubadminModal,
    newAdminData, 
    setNewAdminData, 
    setEditRoleModal,
    fetchManagementData
}) => {
    return (
        <motion.div key="subadmins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '2rem', margin: 0 }}>Sub-admins (City Managers)</h2>
                <button className="btn btn-primary" onClick={() => setShowAddSubadminModal(true)}>+ Add Sub-admin</button>
            </div>
            <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ padding: '16px' }}>Name</th>
                            <th style={{ padding: '16px' }}>Email</th>
                            <th style={{ padding: '16px' }}>City Scope</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managementData.admins?.map(admin => (
                            <tr key={admin._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td data-label="Name" style={{ padding: '16px' }}>{admin.name}</td>
                                <td data-label="Email" style={{ padding: '16px', color: 'var(--text-muted)' }}>{admin.email}</td>
                                <td data-label="City Scope" style={{ padding: '16px' }}>{admin.city?.name || 'Unassigned'}</td>
                                <td data-label="Status" style={{ padding: '16px' }}>
                                    <span className={`status-badge status-${admin.status === 'active' ? 'success' : (admin.status === 'suspended' ? 'error' : 'warning')}`}>
                                        {admin.status === 'active' ? 'Active' : (admin.status === 'suspended' ? 'Suspended' : 'Pending')}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button onClick={() => setEditRoleModal(admin)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit Role</button>
                                </td>
                            </tr>
                        ))}
                        {managementData.admins?.length === 0 && (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No Sub-admins found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAddSubadminModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ padding: '30px', width: '400px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Add New Sub-admin</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const res = await fetch(`${API_URL}/superadmin/users`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                    body: JSON.stringify(newAdminData)
                                });
                                if (res.ok) {
                                    toast.success('Sub-admin added successfully');
                                    setShowAddSubadminModal(false);
                                    setNewAdminData({ name: '', email: '', password: '', role: 'admin', cityId: '', isApproved: true });
                                    fetchManagementData();
                                } else {
                                    const err = await res.json();
                                    toast.error(err.message || 'Failed to add sub-admin');
                                }
                            } catch(err) {
                                toast.error('Network error');
                            }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="input-group">
                                <label>Name</label>
                                <input type="text" required className="form-control" value={newAdminData.name} onChange={e => setNewAdminData({...newAdminData, name: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" required className="form-control" value={newAdminData.email} onChange={e => setNewAdminData({...newAdminData, email: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input type="password" required className="form-control" value={newAdminData.password} onChange={e => setNewAdminData({...newAdminData, password: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label>City Scope</label>
                                <select className="form-control" value={newAdminData.cityId} onChange={e => setNewAdminData({...newAdminData, cityId: e.target.value})}>
                                    <option value="">-- Unassigned --</option>
                                    {cities.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}, {c.state}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowAddSubadminModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default SubadminsTab;
