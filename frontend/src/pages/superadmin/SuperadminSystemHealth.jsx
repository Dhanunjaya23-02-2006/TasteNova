import React, { useState, useEffect, useContext } from 'react';
import { Activity, Server, Database, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const SuperadminSystemHealth = () => {
    const { user } = useContext(AuthContext);
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/superadmin/system-health`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHealthData(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
    }, [user.token]);

    const handleRunDiagnostics = () => {
        toast.success('Running system diagnostics...');
        fetchHealth();
    };

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">System Health</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Monitor infrastructure status, third-party integrations, and API latency.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleRunDiagnostics} disabled={loading}>
                        <Activity size={16} /> {loading ? 'Running...' : 'Run Diagnostics'}
                    </button>
                </div>
            </div>

            {/* Global Status Banner */}
            {healthData && healthData.overall !== 'Operational' && (
                <div className="sa-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(243, 156, 18, 0.05)', border: '1px solid rgba(243, 156, 18, 0.3)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(243, 156, 18, 0.2)', color: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#b9770e' }}>Partial Degradation Detected</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#d68910' }}>One or more system components are experiencing issues.</p>
                    </div>
                </div>
            )}

            {/* Services Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {healthData?.health.map((service, idx) => {
                    let IconComponent = Server;
                    if (service.name.includes('Database')) IconComponent = Database;
                    if (service.name.includes('Payment')) IconComponent = CreditCardIcon;
                    if (service.name.includes('Maps')) IconComponent = Globe;
                    
                    return (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="sa-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${service.color}15`, color: service.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IconComponent size={20} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{service.name}</span>
                            </div>
                            {service.status === 'Operational' ? (
                                <CheckCircle size={20} color="#27ae60" />
                            ) : (
                                <AlertTriangle size={20} color="#f39c12" />
                            )}
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Status</div>
                                <div style={{ fontWeight: 600, color: service.color }}>{service.status}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Latency</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{service.latency}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Uptime (30d)</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{service.uptime}</div>
                            </div>
                        </div>
                    </motion.div>
                )})}
            </div>

            {/* System Logs Preview */}
            <div className="sa-card" style={{ padding: '24px', marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Recent System Events</h3>
                <div style={{ background: '#1e1e24', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#a9b7c6', display: 'flex', flexDirection: 'column', gap: '8px', height: '200px', overflowY: 'auto' }}>
                    {healthData?.logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                    {!healthData?.logs && <div>Loading logs...</div>}
                </div>
            </div>
        </div>
    );
};

// Local component since lucide doesn't have CreditCardIcon by that exact name in older versions, we use something else or define it
const CreditCardIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
);

export default SuperadminSystemHealth;
