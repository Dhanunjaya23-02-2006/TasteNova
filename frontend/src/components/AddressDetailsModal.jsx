import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { MapPin, X, Home, Briefcase, Map } from 'lucide-react';

const AddressDetailsModal = ({ isOpen, onClose, locationData, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        houseFlat: '',
        floor: '',
        building: '',
        street: '',
        landmark: '',
        receiverName: '',
        phone: '',
        deliveryInstructions: '',
        label: 'Home'
    });

    if (!isOpen || !locationData) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const modalContent = (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '600px', maxHeight: '90vh', borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 -10px 30px rgba(0,0,0,0.2)', overflowY: 'auto' }} className="animate-fade-up">
                
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 'bold' }}>Enter address details</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>
                
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Location Summary */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <MapPin size={24} color="var(--primary-color, #006400)" style={{ marginTop: '2px' }} />
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {locationData.suburb || 'Selected Location'}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                {locationData.address}
                            </p>
                        </div>
                    </div>

                    <form id="addressForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>House / Flat / Block No. *</label>
                                <input 
                                    type="text" 
                                    name="houseFlat"
                                    required
                                    value={formData.houseFlat}
                                    onChange={handleChange}
                                    placeholder="e.g. 2-104/A"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Floor</label>
                                <input 
                                    type="text" 
                                    name="floor"
                                    value={formData.floor}
                                    onChange={handleChange}
                                    placeholder="e.g. 2nd Floor"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Apartment / Building / Street</label>
                            <input 
                                type="text" 
                                name="building"
                                value={formData.building}
                                onChange={handleChange}
                                placeholder="e.g. ABC Apartments, Road No 3"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Nearby Landmark</label>
                            <input 
                                type="text" 
                                name="landmark"
                                value={formData.landmark}
                                onChange={handleChange}
                                placeholder="e.g. Near Metro Station"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                            />
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }}></div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Receiver Name *</label>
                            <input 
                                type="text" 
                                name="receiverName"
                                required
                                value={formData.receiverName}
                                onChange={handleChange}
                                placeholder="e.g. Ambati Dhanunjaya"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Phone Number *</label>
                            <input 
                                type="text" 
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. +91 9876543210"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Delivery Instructions</label>
                            <textarea 
                                name="deliveryInstructions"
                                value={formData.deliveryInstructions}
                                onChange={handleChange}
                                placeholder="e.g. Leave at door, Ring the bell"
                                rows="2"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }}></div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>Save Address As</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {['Home', 'Work', 'Other'].map((type) => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => setFormData({ ...formData, label: type })}
                                        style={{ 
                                            flex: 1, 
                                            padding: '12px', 
                                            borderRadius: '8px', 
                                            border: formData.label === type ? '2px solid var(--primary-color, #006400)' : '1px solid var(--border)', 
                                            background: formData.label === type ? 'rgba(0, 100, 0, 0.05)' : '#fff',
                                            color: formData.label === type ? 'var(--primary-color, #006400)' : 'var(--text-main)',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {type === 'Home' && <Home size={18} />}
                                        {type === 'Work' && <Briefcase size={18} />}
                                        {type === 'Other' && <Map size={18} />}
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: '#fff', position: 'sticky', bottom: 0, zIndex: 10 }}>
                    <button 
                        type="submit"
                        form="addressForm"
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700 }}
                    >
                        {isLoading ? 'Saving...' : 'Save Address'}
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default AddressDetailsModal;
