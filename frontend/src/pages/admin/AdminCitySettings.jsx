import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';
import { Settings, Save, MapPin } from 'lucide-react';

const AdminCitySettings = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [form, setForm] = useState({
        name: '',
        state: '',
        baseDeliveryFee: 40,
        perKmFee: 10,
        freeDeliveryThreshold: 500,
        refundThreshold: 500,
        commissionRate: 15,
        deliveryRadius: 10
    });

    const fetchCitySettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/city-settings`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setForm({
                    name: data.name || '',
                    state: data.state || '',
                    baseDeliveryFee: data.baseDeliveryFee || 0,
                    perKmFee: data.perKmFee || 0,
                    freeDeliveryThreshold: data.freeDeliveryThreshold || 0,
                    refundThreshold: data.refundThreshold || 0,
                    commissionRate: data.commissionRate || 0,
                    deliveryRadius: data.deliveryRadius || 10
                });
            } else {
                toast.error('Failed to load city settings');
            }
        } catch (e) {
            toast.error('Error fetching city settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCitySettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/admin/city-settings`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                toast.success('City settings updated successfully');
            } else {
                const d = await res.json();
                toast.error(d.message || 'Failed to update settings');
            }
        } catch (e) {
            toast.error('Error updating settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="sa-empty">Loading settings...</div>;
    }

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1>City Configuration</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        Manage operational limits, delivery fees, and financial thresholds for your assigned city.
                    </p>
                </div>
            </div>

            <div className="sa-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="sa-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <MapPin size={20} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                        {form.name ? `${form.name}, ${form.state}` : 'City Settings'}
                    </h3>
                </div>

                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        
                        {/* Delivery Fees */}
                        <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                                Delivery Configuration
                            </h4>
                            
                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <label>Base Delivery Fee (₹)</label>
                                <input type="number" required className="sa-input" style={{ width: '100%' }} value={form.baseDeliveryFee} onChange={e => setForm({...form, baseDeliveryFee: e.target.value})} />
                            </div>
                            
                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <label>Per Km Fee (₹)</label>
                                <input type="number" required className="sa-input" style={{ width: '100%' }} value={form.perKmFee} onChange={e => setForm({...form, perKmFee: e.target.value})} />
                            </div>

                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <label>Max Delivery Radius (km)</label>
                                <input type="number" required className="sa-input" style={{ width: '100%' }} value={form.deliveryRadius} onChange={e => setForm({...form, deliveryRadius: e.target.value})} />
                            </div>
                        </div>

                        {/* Financial Thresholds */}
                        <div style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                                Financial Settings
                            </h4>
                            
                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <label>Commission Rate (%)</label>
                                <input type="number" required className="sa-input" style={{ width: '100%' }} value={form.commissionRate} onChange={e => setForm({...form, commissionRate: e.target.value})} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Percentage cut taken from chef orders</span>
                            </div>

                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <label>Free Delivery Minimum (₹)</label>
                                <input type="number" required className="sa-input" style={{ width: '100%' }} value={form.freeDeliveryThreshold} onChange={e => setForm({...form, freeDeliveryThreshold: e.target.value})} />
                            </div>

                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <label>Auto-Refund Threshold (₹)</label>
                                <input type="number" required className="sa-input" style={{ width: '100%' }} value={form.refundThreshold} onChange={e => setForm({...form, refundThreshold: e.target.value})} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Refunds below this amount are auto-approved</span>
                            </div>
                        </div>

                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCitySettings;
