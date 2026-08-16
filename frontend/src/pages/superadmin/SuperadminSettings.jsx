import React, { useState, useEffect, useContext } from 'react';
import { Save, Settings, Globe, Shield, CreditCard, Bell, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const SuperadminSettings = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('General');
    const [settings, setSettings] = useState({
        platformName: '',
        supportEmail: '',
        baseDeliveryFee: 40,
        maintenanceMode: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/settings`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (err) {
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [user.token]);

    const handleSave = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                toast.success('Settings Saved Successfully');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (err) {
            toast.error('Error saving settings');
        }
    };

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Platform Settings</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Configure global platform parameters and environment variables.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={handleSave}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Settings Sidebar */}
                <div className="sa-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                            { id: 'General', icon: Globe },
                            { id: 'Security', icon: Shield },
                            { id: 'Payments', icon: CreditCard },
                            { id: 'Notifications', icon: Bell },
                            { id: 'Advanced', icon: Settings },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none',
                                    background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab.id ? 700 : 500,
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                            >
                                <tab.icon size={18} />
                                {tab.id}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Content Area */}
                <div className="sa-card" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>{activeTab} Configuration</h2>

                    {loading ? <div className="sa-empty">Loading Settings...</div> : activeTab === 'General' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Platform Name</label>
                                <input type="text" className="sa-search" value={settings.platformName} onChange={(e) => setSettings({...settings, platformName: e.target.value})} style={{ width: '100%', maxWidth: '400px', padding: '10px 16px', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Support Email Address</label>
                                <input type="email" className="sa-search" value={settings.supportEmail} onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} style={{ width: '100%', maxWidth: '400px', padding: '10px 16px', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Base Delivery Fee (₹)</label>
                                <input type="number" className="sa-search" value={settings.baseDeliveryFee} onChange={(e) => setSettings({...settings, baseDeliveryFee: Number(e.target.value)})} style={{ width: '100%', maxWidth: '200px', padding: '10px 16px', borderRadius: '8px' }} />
                                <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Default delivery fee applied if no city-specific rules match.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8f9fa', borderRadius: '8px', maxWidth: '400px', border: '1px solid var(--border-subtle)' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>Maintenance Mode</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Temporarily disable customer app access</p>
                                </div>
                                <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => {
                                            setSettings({...settings, maintenanceMode: e.target.checked});
                                            if (e.target.checked) toast.success('Maintenance Mode Enabled (Requires Save)');
                                        }}
                                        style={{ opacity: 0, width: 0, height: 0 }} 
                                    />
                                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settings.maintenanceMode ? '#e74c3c' : '#ccc', borderRadius: '24px', transition: '.4s' }}></span>
                                    <span style={{ position: 'absolute', height: '16px', width: '16px', left: settings.maintenanceMode ? '20px' : '4px', bottom: '4px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'General' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                            <Settings size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p>Configuration options for {activeTab} will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperadminSettings;
