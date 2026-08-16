import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MapPin, Plus, Trash2, Home, Briefcase, Map } from 'lucide-react';
import LocationPickerModal from '../LocationPickerModal';
import AddressDetailsModal from '../AddressDetailsModal';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const AddressesTab = () => {
    const { user, login, updateUser } = useContext(AuthContext); 
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const getIcon = (label) => {
        if (label?.toLowerCase().includes('home')) return <Home size={20} />;
        if (label?.toLowerCase().includes('work') || label?.toLowerCase().includes('office')) return <Briefcase size={20} />;
        return <Map size={20} />;
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            const res = await fetch(`${API_URL}/users/addresses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success('Address deleted');
                const updatedUser = { ...user, addresses: user.addresses.filter(a => a._id !== id) };
                updateUser(updatedUser);
            } else {
                toast.error(data.message || 'Failed to delete address');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setDeletingId(null);
        }
    };

    const handleLocationSelect = (locationData) => {
        setSelectedLocation(locationData);
        setIsDetailsModalOpen(true);
    };

    const handleSaveAddress = async (formData) => {
        setIsAdding(true);
        try {
            const payload = {
                ...formData,
                city: selectedLocation.city || 'Hyderabad',
                state: selectedLocation.state || 'Telangana',
                pincode: selectedLocation.pincode || '',
                area: selectedLocation.suburb || 'Unknown Area',
                formattedAddress: `${formData.houseFlat}${formData.building ? ', ' + formData.building : ''}, ${selectedLocation.address}`,
                location: {
                    type: 'Point',
                    coordinates: [selectedLocation.lng, selectedLocation.lat]
                }
            };

            const res = await fetch(`${API_URL}/users/addresses`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success('Address added successfully');
                const updatedUser = { ...user, addresses: data.addresses };
                updateUser(updatedUser);
                setIsDetailsModalOpen(false);
                setSelectedLocation(null);
            } else {
                toast.error(data.message || 'Failed to add address');
            }
        } catch (error) {
            toast.error('An error occurred while adding address');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Saved Addresses</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your delivery locations for faster checkout.</p>
                </div>
                
                <button 
                    onClick={() => setIsMapModalOpen(true)}
                    className="btn btn-primary" 
                    style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Add New Address
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {user?.addresses && user.addresses.length > 0 ? (
                    user.addresses.map(addr => (
                        <div key={addr._id} style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 100, 0, 0.1)', color: 'var(--primary-color, #006400)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                        {getIcon(addr.label)}
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{addr.label || 'Saved Location'}</h4>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{addr.receiverName} • {addr.phone}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0, flex: 1 }}>
                                {addr.formattedAddress || addr.streetAddress}
                            </p>
                            
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button 
                                    onClick={() => handleDelete(addr._id)}
                                    disabled={deletingId === addr._id}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 71, 87, 0.3)', background: 'transparent', color: '#ff4757', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <Trash2 size={16} /> {deletingId === addr._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
                        <MapPin size={48} style={{ color: 'var(--border)', margin: '0 auto 16px' }} />
                        <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '8px' }}>No addresses saved</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Add a delivery location to see nearby kitchens.</p>
                        <button onClick={() => setIsMapModalOpen(true)} className="btn btn-outline" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                            Add Address
                        </button>
                    </div>
                )}
            </div>

            <LocationPickerModal 
                isOpen={isMapModalOpen} 
                onClose={() => setIsMapModalOpen(false)} 
                onSelect={handleLocationSelect}
            />

            <AddressDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                locationData={selectedLocation}
                onSave={handleSaveAddress}
                isLoading={isAdding}
            />
        </div>
    );
};

export default AddressesTab;
