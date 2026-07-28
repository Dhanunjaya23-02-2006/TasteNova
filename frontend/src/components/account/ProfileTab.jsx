import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        return data.display_name || '';
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return '';
    }
};

const ProfileTab = () => {
    const { user, login } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [newAddressLabel, setNewAddressLabel] = useState('Home');
    const [newStreetAddress, setNewStreetAddress] = useState('');
    const [newPosition, setNewPosition] = useState(null);
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [fssaiNumber, setFssaiNumber] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [description, setDescription] = useState('');
    const [kitchenImage, setKitchenImage] = useState('');
    const [deliveryRadius, setDeliveryRadius] = useState(6);
    const [kitchenLocation, setKitchenLocation] = useState(null);
    const [statusText, setStatusText] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(data);
                setName(data.name);
                setPhone(data.phone || '');
                setAddresses(data.addresses || []);
                setRole(data.role);
                setEmail(data.email || '');
                setFssaiNumber(data.fssaiNumber || '');
                setBusinessName(data.businessName || '');
                setDescription(data.description || '');
                setKitchenImage(data.kitchenImage || '');
                if (data.deliveryRadius) setDeliveryRadius(data.deliveryRadius);
                if (data.kitchenLocation && data.kitchenLocation.coordinates) {
                    setKitchenLocation({ 
                        lat: data.kitchenLocation.coordinates[1], 
                        lng: data.kitchenLocation.coordinates[0] 
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setStatusText('Updating...');

        try {
            const reqBody = { name, phone, role, businessName, description, kitchenImage, addresses };
            if (role === 'chef') {
                reqBody.deliveryRadius = deliveryRadius;
                if (kitchenLocation) {
                    reqBody.kitchenLocation = { 
                        type: 'Point', 
                        coordinates: [kitchenLocation.lng, kitchenLocation.lat] 
                    };
                }
            }

            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(reqBody)
            });

            const data = await res.json();
            if (res.ok) {
                setStatusText('Profile updated successfully!');
                login(data); // Update context
                setIsEditing(false);
                fetchProfile(); // Refresh
                setTimeout(() => setStatusText(''), 3000);
            } else {
                setStatusText(data.message || 'Update failed');
            }
        } catch (error) {
            setStatusText('Error updating profile');
        }
    };

    const handleAddAddress = () => {
        if (!newPosition || !newStreetAddress) {
            toast.error('Please provide an address and pick a location on the map');
            return;
        }

        const newAddress = {
            label: newAddressLabel,
            streetAddress: newStreetAddress,
            location: { lat: newPosition.lat, lng: newPosition.lng }
        };

        setAddresses([...addresses, newAddress]);

        setNewAddressLabel('Home');
        setNewStreetAddress('');
        setNewPosition(null);
    };

    const handleRemoveAddress = (index) => {
        const newAddresses = [...addresses];
        newAddresses.splice(index, 1);
        setAddresses(newAddresses);
    };

    if (!profile) return <p className="text-center mt-4">Loading...</p>;

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px', boxShadow: 'var(--shadow-floating)', animation: 'fadeInUp 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '15px', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '1.6rem' }}>Profile Overview</h3>
                <button className="btn btn-outline" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancel Edit ✕' : 'Edit Profile ✎'}</button>
            </div>

            {statusText && <p className="text-center" style={{ color: statusText.includes('success') ? 'var(--success)' : 'red', fontSize: '1.1rem', fontWeight: 'bold' }}>{statusText}</p>}

            {!isEditing ? (
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Name</span>
                        <span style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{profile.name}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Email</span>
                        <span style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{profile.email}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Phone</span>
                        <span style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{profile.phone || 'Not provided'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Role</span>
                        <span style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', fontSize: '0.9rem' }}>{profile.role === 'admin' ? 'SUB-ADMIN' : profile.role}</span>
                    </div>

                    <h4 className="mt-4 mb-2" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>Saved Addresses</h4>
                    {addresses.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No saved addresses.</p>
                    ) : (
                        <ul style={{ listStyleType: 'none', padding: 0, display: 'grid', gap: '15px' }}>
                            {addresses.map((addr, idx) => (
                                <li key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <MapPin size={18} color="var(--primary)" />
                                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{addr.label}</strong>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', paddingLeft: '28px', marginBottom: '10px' }}>{addr.streetAddress}</div>
                                    <div style={{ color: 'var(--text-muted)', opacity: 0.5, fontSize: '0.8rem', paddingLeft: '28px' }}>Lat: {addr.location.lat.toFixed(4)}, Lng: {addr.location.lng.toFixed(4)}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {user.role === 'admin' && (
                        <p style={{ marginTop: '20px', color: 'var(--primary)', fontSize: '0.9rem', background: 'rgba(212, 175, 55, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                            * As an admin, your primary (first) saved address will be used as the Kitchen Location for delivery radius calculations.
                        </p>
                    )}
                </div>
            ) : (
                <form onSubmit={handleUpdateProfile}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Email (Cannot be changed)</label>
                        <input className="form-control" type="email" value={email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Name</label>
                        <input className="form-control" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Phone</label>
                        <input className="form-control" type="text" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Account Type / Role</label>
                        <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                            <option value="user" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>Customer (Order Food)</option>
                            <option value="chef" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>Home/Cloud Kitchen Owner (Chef)</option>
                            <option value="delivery" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>Delivery Partner</option>
                        </select>
                    </div>

                    {role === 'chef' && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>FSSAI Certificate Number (Cannot be changed)</label>
                                <input className="form-control" type="text" value={fssaiNumber} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} placeholder="Not Provided" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Kitchen/Business Name</label>
                                <input className="form-control" type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Kitchen Description</label>
                                <textarea className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)} required />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Kitchen Image URL</label>
                                <input className="form-control" type="text" value={kitchenImage} onChange={e => setKitchenImage(e.target.value)} required />
                            </div>

                            <div style={{ marginBottom: '16px', background: 'rgba(212, 175, 55, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Hyperlocal Delivery Settings</h4>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                                    Delivery Radius (km): {deliveryRadius} km
                                </label>
                                <input 
                                    type="range" 
                                    min="2" max="10" step="1" 
                                    value={deliveryRadius} 
                                    onChange={e => setDeliveryRadius(parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary)', marginBottom: '15px' }}
                                />

                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Exact Kitchen Location (Drop a pin)</label>
                                <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '10px' }}>
                                    <MapContainer center={kitchenLocation ? [kitchenLocation.lat, kitchenLocation.lng] : [17.4483, 78.3915]} zoom={kitchenLocation ? 15 : 11} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}" />
                                        <LocationPicker position={kitchenLocation} setPosition={setKitchenLocation} />
                                    </MapContainer>
                                </div>
                                {kitchenLocation ? (
                                    <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>✓ Kitchen location secured</span>
                                ) : (
                                    <span style={{ color: 'var(--secondary-color)', fontSize: '0.85rem' }}>⚠ Please tap on the map to set your kitchen's exact location</span>
                                )}
                            </div>
                        </>
                    )}

                    <h4 className="mt-4 mb-2">Manage Addresses</h4>
                    <div style={{ background: 'var(--bg-body)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        {addresses.map((addr, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', background: 'var(--bg-body)', padding: '10px', borderRadius: '8px' }}>
                                <div>
                                    <strong>{addr.label}</strong>: {addr.streetAddress}
                                </div>
                                <button type="button" className="btn btn-outline" style={{ padding: '5px 10px', borderColor: 'red', color: 'red' }} onClick={() => handleRemoveAddress(idx)}>Remove</button>
                            </div>
                        ))}

                        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                            <h5>Add New Address</h5>
                            <div className="input-group flex gap-2">
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Label</label>
                                    <input className="form-control" type="text" value={newAddressLabel} onChange={e => setNewAddressLabel(e.target.value)} placeholder="Home, Work, etc." />
                                </div>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Street Address</label>
                                    <input className="form-control" type="text" value={newStreetAddress} onChange={e => setNewStreetAddress(e.target.value)} placeholder="123 Main St" />
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Pick Location from Map</label>
                                <div style={{ marginBottom: '10px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            if (navigator.geolocation) {
                                                navigator.geolocation.getCurrentPosition(
                                                    async (pos) => {
                                                        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                                        setNewPosition(latlng);
                                                        const addr = await reverseGeocode(latlng.lat, latlng.lng);
                                                        if (addr) setNewStreetAddress(addr);
                                                    },
                                                    (err) => toast.error("Please allow location access to use this feature.")
                                                );
                                            } else {
                                                toast.error("Geolocation is not supported by your browser.");
                                            }
                                        }}
                                        style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                                    >
                                        Fetch My Current Location
                                    </button>
                                </div>
                                <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '10px' }}>
                                    <MapContainer center={newPosition ? [newPosition.lat, newPosition.lng] : [19.0760, 72.8777]} zoom={newPosition ? 15 : 11} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}" />
                                        <LocationPicker position={newPosition} setPosition={async (pos) => {
                                            setNewPosition(pos);
                                            const addr = await reverseGeocode(pos.lat, pos.lng);
                                            if (addr) setNewStreetAddress(addr);
                                        }} />
                                    </MapContainer>
                                </div>
                                {newPosition && <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Location picked! [{newPosition.lat.toFixed(4)}, {newPosition.lng.toFixed(4)}]</span>}
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={handleAddAddress} style={{ width: '100%' }}>Add Address to List</button>
                        </div>
                    </div>

                    {user.role === 'admin' && (
                        <p style={{ color: 'var(--primary-color)', fontSize: '0.9rem', marginBottom: '10px' }}>
                            * Note: The <strong>first address</strong> in your list acts as the main TasteNova Kitchen Location.
                        </p>
                    )}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Profile Improvements</button>
                </form>
            )}
        </div>
    );
};

export default ProfileTab;
