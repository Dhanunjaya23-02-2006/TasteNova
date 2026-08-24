import React, { useState, useEffect, useContext } from 'react';
import { Search, Receipt, Percent, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminTaxes = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [search, setSearch] = useState('');
    const [taxRules, setTaxRules] = useState([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({ category: '', rate: '', taxType: 'GST', status: 'Active' });

    const fetchTaxes = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/taxes`, { headers: { Authorization: `Bearer ${user.token}` } });
            if(res.ok) setTaxRules(await res.json());
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        if(user) fetchTaxes();
    }, [user, lastUpdated]);


    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Tax Configuration</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage GST rates and tax rules applied across the platform.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px' }} 
                        onClick={() => {
                            setEditingRule(null);
                            setFormData({ category: '', rate: '', taxType: 'GST', status: 'Active' });
                            setIsModalOpen(true);
                        }}
                    >
                        + Add Tax Rule
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(39, 174, 96, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Receipt size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Taxes Collected (MTD)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>₹85,400</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Percent size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Rules</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{taxRules.filter(t => t.status === 'Active').length}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reports Generated</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>12</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="sa-modal-title">Tax Rules</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="sa-search" style={{ paddingLeft: '32px', width: '200px' }} placeholder="Search category..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Rule ID</th>
                                <th>Category / Applied On</th>
                                <th>Tax Type</th>
                                <th>Rate</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxRules.filter(t => t.category.toLowerCase().includes(search.toLowerCase())).map(t => (
                                <tr key={t._id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{t._id.substring(t._id.length - 8).toUpperCase()}</td>
                                    <td style={{ fontWeight: 600 }}>{t.category}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{t.taxType}</td>
                                    <td style={{ fontWeight: 800, color: '#0F3F26' }}>{t.rate}%</td>
                                    <td>
                                        <span className={`sa-badge ${t.status === 'Active' ? 'sa-badge-green' : 'sa-badge-red'}`}>{t.status}</span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ padding: '4px 10px', fontSize: '0.8rem' }} 
                                            onClick={() => {
                                                setEditingRule(t);
                                                setFormData({ category: t.category, rate: t.rate, taxType: t.taxType, status: t.status });
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="sa-modal-card">
                        <X size={20} className="sa-modal-close" onClick={() => setIsModalOpen(false)} />
                        <h3 className="sa-modal-title">{editingRule ? 'Edit Tax Rule' : 'Create Tax Rule'}</h3>
                        
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const method = editingRule ? 'PUT' : 'POST';
                                const url = editingRule 
                                    ? `${API_URL}/superadmin/finance/taxes/${editingRule._id}`
                                    : `${API_URL}/superadmin/finance/taxes`;
                                
                                const res = await fetch(url, {
                                    method,
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                    body: JSON.stringify({
                                        category: formData.category,
                                        rate: Number(formData.rate),
                                        taxType: formData.taxType,
                                        status: formData.status
                                    })
                                });
                                
                                if(res.ok) {
                                    toast.success(editingRule ? 'Tax rule updated' : 'Tax rule created');
                                    setIsModalOpen(false);
                                    fetchTaxes();
                                } else {
                                    toast.error('Failed to save tax rule');
                                }
                            } catch(err) {
                                toast.error('An error occurred');
                            }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="sa-form-label">Category Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={formData.category} 
                                    onChange={e => setFormData({...formData, category: e.target.value})} 
                                    required 
                                    placeholder="e.g., Platform Fee"
                                    disabled={!!editingRule} // Don't let them change category name if editing
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="sa-form-label">Tax Rate (%)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={formData.rate} 
                                        onChange={e => setFormData({...formData, rate: e.target.value})} 
                                        required 
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="sa-form-label">Status</label>
                                    <select 
                                        className="form-control" 
                                        value={formData.status} 
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                                {editingRule ? 'Save Changes' : 'Create Tax Rule'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperadminTaxes;
