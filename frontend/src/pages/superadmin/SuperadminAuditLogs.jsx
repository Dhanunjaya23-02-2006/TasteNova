import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ShieldAlert, User as UserIcon, Calendar } from 'lucide-react';
import { API_URL } from '../../config';

const SuperadminAuditLogs = () => {
    const { user } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/audit-logs`, { headers: { Authorization: `Bearer ${user.token}` } });
                if (res.ok) setLogs(await res.json());
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchLogs();
    }, [user]);

    return (
        <div>
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Audit Logs</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Global feed of platform actions</p>
                </div>
            </div>

            <div className="sa-card">
                {loading ? <div className="sa-empty">Loading logs...</div> : logs.length === 0 ? <div className="sa-empty">No audit logs found.</div> : (
                    <table className="sa-table" style={{ fontSize: '0.85rem' }}>
                        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id}>
                                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                                            {log.role === 'superadmin' ? <ShieldAlert size={14} color="var(--accent)" /> : <UserIcon size={14} color="var(--primary)" />}
                                            {log.userId?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td><span className="sa-badge sa-badge-gray" style={{ fontSize: '0.75rem' }}>{log.action}</span></td>
                                    <td>{log.resourceType} {log.resourceId ? `(${log.resourceId})` : ''}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{log.notes || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SuperadminAuditLogs;
