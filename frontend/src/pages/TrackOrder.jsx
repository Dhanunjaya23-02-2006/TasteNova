import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { API_URL } from '../config';
import toast from 'react-hot-toast';

const socket = io(API_URL.replace('/api', ''));

// Custom Icons
const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2950/2950150.png',
    iconSize: [38, 38],
});
const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1047/1047711.png',
    iconSize: [38, 38]
});

const TrackOrder = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [riderPos, setRiderPos] = useState(null);
    const [destination, setDestination] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await fetch(`${API_URL}/orders/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setOrder(data);

                    if (data.shippingAddress && data.shippingAddress.lat) {
                        setDestination([data.shippingAddress.lat, data.shippingAddress.lng]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch order", err);
                toast.error("Failed to fetch order details");
            }
        };

        fetchOrder();
    }, [id, user, navigate]);

    useEffect(() => {
        if (order && (order.status !== 'Completed' && order.status !== 'Rejected')) {
            socket.emit('join_tracking', order._id);

            socket.on('receive_location', (data) => {
                setRiderPos([data.lat, data.lng]);
            });

            return () => {
                socket.off('receive_location');
            };
        }
    }, [order]);

    if (!order) return <p className="text-center mt-4">Loading order details...</p>;

    return (
        <div className="container mt-4" style={{ animation: 'fadeInUp 0.6s ease' }}>
            <div style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'center', marginBottom: '1.5rem', borderBottom: '4px solid var(--primary-color)' }}>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '15px', color: 'var(--text-dark)' }}>Tracking Order <span style={{ color: 'var(--primary-color)' }}>#{order._id.substring(order._id.length - 6)}</span></h2>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', marginTop: '10px' }}>
                    <span style={{ padding: '10px 20px', borderRadius: '30px', background: 'var(--bg-body)', fontSize: '1.1rem', border: '1px solid var(--border)', color: 'var(--text-dark)' }}>
                        Order Status: <strong style={{ color: 'var(--success)' }}>{order.status}</strong>
                    </span>
                    <span style={{ padding: '10px 20px', borderRadius: '30px', background: 'var(--primary-color)', color: 'var(--text-dark)', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(252,128,25,0.3)' }}>
                        Logistics: <strong>{order.deliveryStatus}</strong>
                    </span>
                </div>
            </div>

            <div style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', height: '550px', overflow: 'hidden', padding: 0 }}>
                {destination ? (
                    <MapContainer center={destination} zoom={14} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {/* Destination Marker */}
                        <Marker position={destination} icon={homeIcon}>
                            <Popup>
                                <div style={{ textAlign: 'center', color: '#333' }}>
                                    <strong>Your Delivery Address</strong><br />
                                    {order.shippingAddress?.address}
                                </div>
                            </Popup>
                        </Marker>

                        {/* Rider Marker (if broadcasting live) */}
                        {riderPos && (
                            <Marker position={riderPos} icon={riderIcon}>
                                <Popup>
                                    <div style={{ textAlign: 'center', color: 'var(--primary-color)' }}>
                                        <strong>Your Delivery Partner</strong><br />
                                        Moving towards destination...
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Line connecting them */}
                        {destination && riderPos && (
                            <Polyline positions={[riderPos, destination]} color="#fc8019" weight={4} dashArray="10, 10" opacity={0.7} />
                        )}
                    </MapContainer>
                ) : (
                    <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                        <p>No valid coordinate data available for map generation.</p>
                    </div>
                )}
            </div>

            <div style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'center', marginTop: '1.5rem' }}>
                {!riderPos && order.deliveryStatus === 'Picked Up' && (
                    <p style={{ color: 'var(--primary-color)', fontSize: '1.2rem', margin: 0 }}>
                        <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>📡</span> Waiting for delivery partner's live GPS signal...
                    </p>
                )}
                {!riderPos && order.deliveryStatus !== 'Picked Up' && order.deliveryStatus !== 'Delivered' && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>Order is being prepared. Radar will activate upon dispatch.</p>
                )}
                {order.deliveryStatus === 'Delivered' && (
                    <p style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.4rem', margin: 0 }}>🎉 Order Successfully Delivered! Enjoy your meal!</p>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
