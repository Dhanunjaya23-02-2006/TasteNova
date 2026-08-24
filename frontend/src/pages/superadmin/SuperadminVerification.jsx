import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const SuperadminVerification = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [chefs, setChefs] = useState([]);
    const [delivery, setDelivery] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/superadmin/verification`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) {
                const d = await res.json();
                setChefs(d.chefs);
                setDelivery(d.delivery);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchQueue(); }, []);

    const handleVerify = async (id, status) => {
        const note = status === 'suspended' ? prompt('Reason for rejection/suspension:') : '';
        if (status === 'suspended' && !note) return;
        try {
            const res = await fetch(`${API_URL}/superadmin/verification/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status, note })
            });
            if (res.ok) { toast.success('Processed'); fetchQueue(); }
            else { toast.error('Failed'); }
        } catch (e) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Verification Queue</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Global review for all pending applications</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                
                {/* Chef Queue */}
                <div className="sa-card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif" }}>Pending Chefs ({chefs.length})</h3>
                    {chefs.length === 0 ? <div className="sa-empty">No pending chefs.</div> : (
                        <table className="sa-table">
                            <thead><tr><th>Name/Kitchen</th><th>City</th><th>Documents</th><th>Actions</th></tr></thead>
                            <tbody>
                                {chefs.map(c => (
                                    <tr key={c._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{c.kitchenName || c.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.email}</div>
                                        </td>
                                        <td>{c.city?.name || '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {c.isIdVerified && <span className="sa-badge sa-badge-green">ID</span>}
                                                {c.isFssaiVerified && <span className="sa-badge sa-badge-green">FSSAI</span>}
                                                {c.isKitchenVerified && <span className="sa-badge sa-badge-green">Kitchen</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleVerify(c._id, 'active')}>Approve</button>
                                                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--error)' }} onClick={() => handleVerify(c._id, 'suspended')}>Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Delivery Queue */}
                <div className="sa-card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif" }}>Pending Delivery Partners ({delivery.length})</h3>
                    {delivery.length === 0 ? <div className="sa-empty">No pending delivery applications.</div> : (
                        <table className="sa-table">
                            <thead><tr><th>Name</th><th>City</th><th>Vehicle</th><th>Actions</th></tr></thead>
                            <tbody>
                                {delivery.map(d => (
                                    <tr key={d._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{d.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.phone}</div>
                                        </td>
                                        <td>{d.city?.name || '—'}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{d.vehicleType || '—'} {d.vehicleNumber || ''}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleVerify(d._id, 'active')}>Approve</button>
                                                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--error)' }} onClick={() => handleVerify(d._id, 'suspended')}>Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SuperadminVerification;
