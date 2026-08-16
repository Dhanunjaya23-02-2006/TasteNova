import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MapPin, Search, Navigation, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map interactions like search flyTo and getting center coordinates
function MapEvents({ setCenter, setAddress }) {
    const map = useMap();

    useEffect(() => {
        const onMoveEnd = async () => {
            const center = map.getCenter();
            setCenter({ lat: center.lat, lng: center.lng });

            // Reverse geocode
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}`);
                const data = await res.json();
                if (data && data.display_name) {
                    setAddress({
                        full: data.display_name,
                        suburb: data.address?.suburb || data.address?.city_district || data.address?.town || data.address?.city || 'Unknown Location',
                        city: data.address?.city || data.address?.town || '',
                        state: data.address?.state || '',
                        pincode: data.address?.postcode || ''
                    });
                }
            } catch (err) {
                console.error("Reverse geocode failed", err);
            }
        };

        map.on('moveend', onMoveEnd);
        return () => {
            map.off('moveend', onMoveEnd);
        };
    }, [map, setCenter, setAddress]);

    return null;
}

function FlyToMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 16);
        }
    }, [center, map]);
    return null;
}

const LocationPickerModal = ({ isOpen, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLocating, setIsLocating] = useState(false);

    // Default center (Hyderabad)
    const [mapCenter, setMapCenter] = useState({ lat: 17.3850, lng: 78.4867 });
    const [flyToCenter, setFlyToCenter] = useState(null);
    const [currentAddress, setCurrentAddress] = useState({ full: 'Loading address...', suburb: 'Loading...' });

    // Initial setup to get user location if possible
    useEffect(() => {
        if (isOpen && 'geolocation' in navigator) {
            handleCurrentLocation();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCurrentLocation = () => {
        setIsLocating(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFlyToCenter({ lat: latitude, lng: longitude });
                    setIsLocating(false);
                },
                (error) => {
                    toast.error('Location access denied. Please search for your area.');
                    setIsLocating(false);
                }
            );
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await res.json();

            if (data && data.length > 0) {
                const result = data[0];
                setFlyToCenter({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
            } else {
                toast.error('Location not found. Try a different search term.');
            }
        } catch (err) {
            toast.error('Search failed.');
        }
    };

    const handleConfirm = () => {
        onSelect({
            lat: mapCenter.lat,
            lng: mapCenter.lng,
            address: currentAddress.full,
            suburb: currentAddress.suburb,
            city: currentAddress.city,
            state: currentAddress.state,
            pincode: currentAddress.pincode
        });
        onClose();
    };

    const modalContent = (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: '#ffffff', width: '90%', maxWidth: '600px', height: '80vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} className="animate-fade-up">

                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', zIndex: 10 }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 'bold' }}>Select delivery location</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ padding: '16px', background: '#fff', zIndex: 10 }}>
                    <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search for area, street or building..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-outline" style={{ padding: '0 16px', borderRadius: '8px' }}>Search</button>
                    </form>

                    <button
                        onClick={handleCurrentLocation}
                        disabled={isLocating}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', color: 'var(--primary-color, #006400)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                        <Navigation size={18} /> {isLocating ? 'Detecting...' : 'Use my current location'}
                    </button>
                </div>

                {/* Map Area */}
                <div style={{ flex: 1, position: 'relative', background: '#eee' }}>
                    <MapContainer
                        center={[mapCenter.lat, mapCenter.lng]}
                        zoom={16}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapEvents setCenter={setMapCenter} setAddress={setCurrentAddress} />
                        {flyToCenter && <FlyToMap center={flyToCenter} />}
                    </MapContainer>

                    {/* Fixed Center Marker */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -100%)', // move up so the tip is at center
                        zIndex: 400, // Leaflet markers are usually z-index 400+
                        pointerEvents: 'none'
                    }}>
                        <MapPin size={40} color="var(--primary-color, #006400)" fill="#fff" />
                    </div>
                </div>

                {/* Footer with Address Confirmation */}
                <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid var(--border)', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ marginTop: '2px', color: 'var(--primary-color, #006400)' }}><MapPin size={24} /></div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {currentAddress.suburb}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                {currentAddress.full}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleConfirm}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default LocationPickerModal;
