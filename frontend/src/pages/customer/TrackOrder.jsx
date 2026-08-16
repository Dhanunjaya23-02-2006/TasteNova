import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Clock, ChefHat, Bike, Home, PhoneCall, HelpCircle } from 'lucide-react';

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
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        { id: 'Placed', label: 'Order Placed', icon: Clock, desc: 'Waiting for kitchen to confirm' },
        { id: 'Accepted', label: 'Confirmed', icon: CheckCircle2, desc: 'Kitchen accepted your order' },
        { id: 'Preparing', label: 'Preparing', icon: ChefHat, desc: 'Your food is being cooked' },
        { id: 'Out for Delivery', label: 'Out for Delivery', icon: Bike, desc: 'Rider is on the way' },
        { id: 'Delivered', label: 'Delivered', icon: Home, desc: 'Enjoy your meal!' }
    ];

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
                    
                    // Determine Active Step
                    const statusIndex = steps.findIndex(s => s.id === data.status || s.id === data.deliveryStatus);
                    if (statusIndex !== -1) {
                        setActiveStep(statusIndex);
                    } else if (data.status === 'Completed' || data.deliveryStatus === 'Delivered') {
                        setActiveStep(4);
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
        if (order && (order.status !== 'Completed' && order.status !== 'Rejected' && order.status !== 'Cancelled')) {
            socket.emit('join_tracking', order._id);

            socket.on('receive_location', (data) => {
                setRiderPos([data.lat, data.lng]);
            });
            
            // Listen for status updates
            socket.on('order_status_update', (data) => {
                if (data.orderId === order._id) {
                    setOrder(prev => ({ ...prev, status: data.status, deliveryStatus: data.deliveryStatus || prev.deliveryStatus }));
                    const statusIndex = steps.findIndex(s => s.id === data.status || s.id === data.deliveryStatus);
                    if (statusIndex !== -1) setActiveStep(statusIndex);
                }
            });

            return () => {
                socket.off('receive_location');
                socket.off('order_status_update');
            };
        }
    }, [order]);

    if (!order) return <div className="container mt-5 text-center"><div className="spinner"></div><p className="mt-3 color-muted">Loading your order...</p></div>;

    const isCancelled = order.status === 'Rejected' || order.status === 'Cancelled';

    return (
        <div className="container mt-4 mb-5" style={{ animation: 'fadeInUp 0.6s ease', maxWidth: '1000px' }}>
            <button onClick={() => navigate('/account/orders')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '24px', fontSize: '0.95rem', fontWeight: 600 }}>
                <ArrowLeft size={18} /> Back to Orders
            </button>
            
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* Left Column: Status & Tracking */}
                <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Status Stepper Header */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div style={{ background: 'rgba(252, 128, 25, 0.1)', color: 'var(--primary-color)', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '1.1rem' }}>
                                ₹{order.totalPrice.toFixed(2)}
                            </div>
                        </div>

                        {isCancelled ? (
                            <div style={{ background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#ff4757' }}>
                                <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Order Cancelled</h3>
                                <p>Unfortunately, your order could not be fulfilled at this time. If you were charged, a refund has been initiated.</p>
                            </div>
                        ) : (
                            <div style={{ position: 'relative', paddingTop: '20px', paddingBottom: '10px' }}>
                                {/* Progress Bar Background */}
                                <div style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '4px', background: 'var(--border-subtle)', zIndex: 1 }}></div>
                                {/* Progress Bar Fill */}
                                <div style={{ position: 'absolute', top: '40px', left: '10%', width: `${(activeStep / (steps.length - 1)) * 80}%`, height: '4px', background: 'var(--primary-color)', zIndex: 2, transition: 'width 0.5s ease' }}></div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 3 }}>
                                    {steps.map((step, index) => {
                                        const isCompleted = index <= activeStep;
                                        const isCurrent = index === activeStep;
                                        return (
                                            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                                                <div style={{ 
                                                    width: '40px', 
                                                    height: '40px', 
                                                    borderRadius: '50%', 
                                                    background: isCompleted ? 'var(--primary-color)' : 'var(--bg-surface)', 
                                                    border: isCompleted ? 'none' : '2px solid var(--border-subtle)',
                                                    color: isCompleted ? '#fff' : 'var(--text-muted)',
                                                    display: 'flex', 
                                                    justifyContent: 'center', 
                                                    alignItems: 'center',
                                                    marginBottom: '12px',
                                                    boxShadow: isCurrent ? '0 0 0 4px rgba(252, 128, 25, 0.2)' : 'none',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    <step.icon size={20} />
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--primary-color)' : isCompleted ? 'var(--text-main)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', background: 'rgba(252, 128, 25, 0.05)', borderRadius: '12px', border: '1px dashed rgba(252, 128, 25, 0.3)' }}>
                                    <h4 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{steps[activeStep]?.label}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{steps[activeStep]?.desc}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Live Tracking Map */}
                    {!isCancelled && activeStep >= 3 && destination && (
                        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#2ed573', animation: 'pulse 1.5s infinite' }}></span>
                                    Live GPS Tracking
                                </h3>
                            </div>
                            <div style={{ height: '350px', width: '100%', position: 'relative' }}>
                                <MapContainer center={destination} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={destination} icon={homeIcon} />
                                    {riderPos && <Marker position={riderPos} icon={riderIcon} />}
                                    {destination && riderPos && (
                                        <Polyline positions={[riderPos, destination]} color="var(--primary-color)" weight={4} dashArray="10, 10" opacity={0.7} />
                                    )}
                                </MapContainer>
                                {!riderPos && activeStep === 3 && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <div className="spinner" style={{ marginBottom: '16px', borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}></div>
                                        <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>Connecting to rider's GPS...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Details */}
                <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Kitchen Info */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '16px' }}>Prepared By</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(252, 128, 25, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-color)' }}>
                                <ChefHat size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '4px' }}>
                                    {order.chef?.businessName || order.chef?.name || 'Home Kitchen'}
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quality Assured Partner</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Partner Info (If out for delivery) */}
                    {!isCancelled && activeStep >= 3 && order.deliveryPartner && (
                        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '16px' }}>Delivery Partner</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(46, 213, 115, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#2ed573' }}>
                                    <Bike size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '4px' }}>
                                        {order.deliveryPartner.name}
                                    </h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vaccinated • 4.8★</p>
                                </div>
                                <a href={`tel:${order.deliveryPartner.phone}`} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-main)' }}>
                                    <PhoneCall size={18} />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '16px' }}>Order Summary</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-main)' }}><span style={{ fontWeight: 600 }}>{item.qty}x</span> {item.menuItem?.name || 'Item'}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ borderTop: '1px dashed var(--border-subtle)', margin: '16px 0' }}></div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <span>Item Total</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>₹{order.itemsPrice.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <span>Platform Fee</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>₹{order.platformFee.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                <span>Delivery Charge</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>₹{order.deliveryCharge.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '16px 0' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>Paid</span>
                            <span style={{ fontSize: '1.25rem', color: 'var(--primary-color)', fontWeight: 800 }}>₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                        
                        <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HelpCircle size={16} /> Need help with this order? <Link to="/account/support" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Support</Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TrackOrder;
