import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const Checkout = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const planId = queryParams.get('planId');

    const { user } = useContext(AuthContext);
    const { cartItems, clearCart, updateQuantity, removeFromCart } = useContext(CartContext);
    
    // Scheduling & Subscription State
    const [subscriptionPlan, setSubscriptionPlan] = useState(null);
    const [orderType, setOrderType] = useState('Instant'); // 'Instant', 'Scheduled'
    const [scheduledTime, setScheduledTime] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [settings, setSettings] = useState({ 
        cartDiscountActive: false, cartDiscountThreshold: 400, cartDiscountPercentage: 10,
        menuDiscountActive: false, menuDiscountPercentage: 10
    });

    // Fallback if user uses new addresses schema or old location field from AuthContext cache
    const defaultUserLoc = user?.addresses && user.addresses.length > 0
        ? { lat: user.addresses[0].location.lat, lng: user.addresses[0].location.lng }
        : user?.location ? { lat: user.location.lat, lng: user.location.lng } : null;

    const [userLocation, setUserLocation] = useState(defaultUserLoc);
    const [adminLocation, setAdminLocation] = useState(null);
    const [distanceError, setDistanceError] = useState('');
    const [shippingAddress, setShippingAddress] = useState(user?.addresses?.[0]?.streetAddress || '');

    const initialLocation = userLocation ? [userLocation.lat, userLocation.lng] : [19.0760, 72.8777];

    const foodTotal = cartItems.reduce((acc, item) => {
        const basePrice = item.price;
        const effectivePrice = item.offerPrice || (settings.menuDiscountActive ? (basePrice * (1 - settings.menuDiscountPercentage / 100)) : basePrice);
        return acc + (effectivePrice * item.qty);
    }, 0);
    const platformFee = 20;
    const deliveryCharge = 40;

    // Calculate global cart discount
    let cartDiscount = 0;
    if (settings.cartDiscountActive && foodTotal >= settings.cartDiscountThreshold) {
        cartDiscount = (foodTotal * (settings.cartDiscountPercentage / 100));
    }

    const totalAmount = subscriptionPlan ? subscriptionPlan.price : (foodTotal + platformFee + deliveryCharge - cartDiscount);

    const [riderPos, setRiderPos] = useState([initialLocation[0] - 0.05, initialLocation[1] - 0.05]);

    useEffect(() => {
        const fetchAdminLocation = async () => {
            try {
                const chefId = cartItems.length > 0 && cartItems[0].chef ? (cartItems[0].chef._id || cartItems[0].chef) : '';
                const url = chefId ? `${API_URL}/users/admin-location?chefId=${chefId}` : `${API_URL}/users/admin-location`;
                const res = await fetch(url);
                const data = await res.json();
                setAdminLocation(data);
                // Set initial rider position to Kitchen/Admin location once fetched
                if (data && data.lat) {
                    setRiderPos([data.lat, data.lng]);
                }
            } catch (error) {
                console.error("Failed to fetch kitchen location", error);
            }
        };

        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/settings`);
                if (res.ok) setSettings(await res.json());
            } catch (error) { console.error("Failed to fetch settings", error); }
        };

        const fetchPlan = async () => {
            if (planId) {
                try {
                    const res = await fetch(`${API_URL}/subscriptions/plans`);
                    const plans = await res.json();
                    const plan = plans.find(p => p._id === planId);
                    if (plan) {
                        setSubscriptionPlan(plan);
                        setOrderType('Subscription');
                        setScheduledTime('13:00'); // Default
                    }
                } catch (error) { console.error(error); }
            }
        };

        fetchAdminLocation();
        fetchSettings();
        fetchPlan();
    }, [planId, cartItems]);

    const navigate = useNavigate();

    const handleFetchLocation = async () => {
        try {
            const loc = await new Promise((resolve, reject) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }),
                        (error) => reject(error)
                    );
                } else {
                    reject(new Error("Geolocation is not supported by this browser."));
                }
            });
            setUserLocation(loc);

            if (adminLocation) {
                const d = calculateDistance(loc.lat, loc.lng, adminLocation.lat, adminLocation.lng);
                if (d > 20) {
                    const errorMsg = `Delivery not available. You are ${d.toFixed(1)}km away from the kitchen (Max 20km limit).`;
                    setDistanceError(errorMsg);
                    toast.error(errorMsg);
                } else {
                    setDistanceError('');
                    toast.success("Location fetched! You are within delivery range.");
                }
            } else {
                toast.success("Location fetched successfully!");
            }
        } catch (error) {
            toast.error("Please allow location access to fetch your coordinates.");
        }
    };

    const handlePayment = async () => {
        if (!user) return toast.error("Please login first");
        if (!subscriptionPlan && cartItems.length === 0) return toast.error("Cart is empty");
        if (!shippingAddress.trim()) return toast.error("Please enter your delivery address");
        if (!userLocation) return toast.error("Please click 'Fetch Current Location' to verify delivery range");
        if (distanceError) return toast.error(distanceError);

        try {
            const res = await fetch(`${API_URL}/payment/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ amount: totalAmount })
            });
            const data = await res.json();

            const options = {
                key: 'rzp_live_SJUMsD5HPAcb2o', // Replace with dynamic env variable if needed
                amount: data.data.amount,
                currency: 'INR',
                name: 'TasteNova',
                description: 'Food Order Payment',
                order_id: data.data.id,
                handler: async function (response) {
                    const verifyRes = await fetch(`${API_URL}/payment/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${user.token}`
                        },
                        body: JSON.stringify(response)
                    });
                    const verifyData = await verifyRes.json();

                    if (verifyRes.ok) {
                        try {
                            if (subscriptionPlan) {
                                // Purchase Subscription
                                await fetch(`${API_URL}/subscriptions/subscribe`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${user.token}`
                                    },
                                    body: JSON.stringify({
                                        planId: subscriptionPlan._id,
                                        selectedTimeSlot: scheduledTime || '13:00',
                                        paymentResult: {
                                            id: response.razorpay_payment_id,
                                            status: 'COMPLETED',
                                            update_time: new Date().toISOString()
                                        }
                                    })
                                });
                                toast.success('Subscription active! Redirecting to dashboard...');
                                navigate('/my-account');
                            } else {
                                // Standard Order (Instant or Scheduled)
                                const orderRes = await fetch(`${API_URL}/orders`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${user.token}`
                                    },
                                    body: JSON.stringify({
                                        orderItems: cartItems.map(i => {
                                            const basePrice = i.price;
                                            const effectivePrice = i.offerPrice || (settings.menuDiscountActive ? (basePrice * (1 - settings.menuDiscountPercentage / 100)) : basePrice);
                                            return {
                                                menuItem: i._id,
                                                qty: i.qty,
                                                price: effectivePrice,
                                                ingredientCost: i.ingredientCost || 0
                                            };
                                        }),
                                        shippingAddress: {
                                            address: shippingAddress,
                                            lat: userLocation ? userLocation.lat : 19.0760,
                                            lng: userLocation ? userLocation.lng : 72.8777
                                        },
                                        paymentMethod: 'Razorpay',
                                        itemsPrice: foodTotal,
                                        ingredientTotalCost: 0,
                                        platformFee: platformFee,
                                        deliveryCharge: deliveryCharge,
                                        totalPrice: totalAmount,
                                        orderType,
                                        scheduledTime
                                    })
                                });
                                const orderData = await orderRes.json();

                                // Also mark order as paid
                                await fetch(`${API_URL}/orders/${orderData._id}/pay`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${user.token}`
                                    },
                                    body: JSON.stringify({
                                        id: response.razorpay_payment_id,
                                        status: 'COMPLETED',
                                        update_time: new Date().toISOString()
                                    })
                                });

                                toast.success('Payment Successful & Order Placed!');
                                clearCart();
                                navigate(`/track/${orderData._id}`);
                            }
                        } catch (err) {
                            console.error(err);
                            toast.error('Order creation failed after payment');
                        }
                    } else {
                        toast.error(verifyData.message || 'Payment Verification Failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone
                }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error(error);
            toast.error("Payment initiation failed");
        }
    };



    return (
        <div className="container flex gap-4 mt-4 animate-fade-up" style={{ flexWrap: 'wrap', paddingBottom: '60px' }}>
            <div className="glass-panel" style={{ padding: '32px', flex: '1 1 600px', boxShadow: 'var(--shadow-floating)' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Your Order summary</h2>
                <hr style={{ borderColor: 'var(--border-subtle)', margin: '20px 0' }} />

                {subscriptionPlan ? (
                    <div>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>{subscriptionPlan.name}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>{subscriptionPlan.description}</p>
                        <p><strong>Type:</strong> {subscriptionPlan.type}</p>
                        <p><strong>Meal Type:</strong> {subscriptionPlan.mealType}</p>
                        <h4 style={{ marginTop: '15px' }}>Price: ₹{subscriptionPlan.price}</h4>
                    </div>
                ) : cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    cartItems.map(item => (
                        <div key={item._id} className="flex justify-between align-center mb-4">
                            <div className="flex gap-4 align-center">
                                <img loading="lazy" src={item.image} alt={item.name} style={{ width: '60px', borderRadius: '8px' }} />
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                                    {item.chef && (
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                                            Kitchen: {item.chef.businessName || item.chef.name}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '2px 8px', fontSize: '1rem', borderRadius: '4px', borderColor: 'var(--border)' }}
                                            onClick={() => updateQuantity(item._id, -1)}
                                        >-</button>
                                        <span style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>{item.qty}</span>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '2px 8px', fontSize: '1rem', borderRadius: '4px', borderColor: 'var(--border)' }}
                                            onClick={() => updateQuantity(item._id, 1)}
                                        >+</button>

                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '2px 8px', fontSize: '0.8rem', borderRadius: '4px', borderColor: '#ff4d4d', color: '#ff4d4d', marginLeft: '10px' }}
                                            onClick={() => removeFromCart(item._id)}
                                            title="Remove item"
                                        >✕</button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'right', color: 'var(--text-main)' }}>
                                ₹{(item.offerPrice || (settings.menuDiscountActive ? (item.price * (1 - settings.menuDiscountPercentage / 100)) : item.price)) * item.qty}
                                {(item.offerPrice || settings.menuDiscountActive) && <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 'normal' }}>Sale Price!</div>}
                            </div>
                        </div>
                    ))
                )}

                {/* Scheduling Options */}
                {(cartItems.length > 0 || subscriptionPlan) && (
                    <>
                        <div className="mt-4 p-4" style={{ background: 'var(--bg-body)', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '15px' }}>Delivery Type</h4>
                    {!subscriptionPlan && (
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="radio" name="orderType" value="Instant" checked={orderType === 'Instant'} onChange={(e) => setOrderType(e.target.value)} />
                                Instant Delivery
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="radio" name="orderType" value="Scheduled" checked={orderType === 'Scheduled'} onChange={(e) => setOrderType(e.target.value)} />
                                Scheduled Order
                            </label>
                        </div>
                    )}
                    
                    {(orderType === 'Scheduled' || subscriptionPlan) && (
                        <div className="form-group">
                            <label>Select Time Slot</label>
                            <input 
                                type="time" 
                                className="form-control" 
                                value={scheduledTime} 
                                onChange={(e) => setScheduledTime(e.target.value)} 
                                required
                            />
                            <small style={{ color: 'var(--text-muted)' }}>Orders placed after the kitchen's cutoff time will be scheduled for the next valid day.</small>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Delivery Address *</label>
                    <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Enter your full delivery address..."
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        required
                    ></textarea>
                </div>

                <div className="mt-4">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Pick Delivery Location from Map *</label>
                    <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '10px' }}>
                        <MapContainer center={userLocation ? [userLocation.lat, userLocation.lng] : [19.0760, 72.8777]} zoom={userLocation ? 15 : 11} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}" />
                            <LocationPicker position={userLocation} setPosition={async (pos) => {
                                setUserLocation(pos);
                                const addr = await reverseGeocode(pos.lat, pos.lng);
                                if (addr) setShippingAddress(addr);
                                
                                if (adminLocation) {
                                    const d = calculateDistance(pos.lat, pos.lng, adminLocation.lat, adminLocation.lng);
                                    if (d > 20) {
                                        setDistanceError(`Delivery not available. You are ${d.toFixed(1)}km away from the kitchen (Max 20km limit).`);
                                    } else {
                                        setDistanceError('');
                                    }
                                }
                            }} />
                        </MapContainer>
                    </div>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleFetchLocation}
                        style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                        </svg>
                        Or Fetch Current Location (GPS)
                    </button>
                    {userLocation && !distanceError && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--success)', marginTop: '8px' }}>
                            ✓ Location selected: [{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}]
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Delivery Note (optional)</label>
                    <textarea className="form-control" rows="2" placeholder="Any specific instructions for chef..."></textarea>
                </div>
                    </>
                )}
            </div>

            {(cartItems.length > 0 || subscriptionPlan) && (
                <div className="glass-panel" style={{ padding: '32px', flex: '1 1 350px', background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.05), rgba(24, 24, 27, 0.8))', boxShadow: 'var(--shadow-floating)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Payment Details</h3>
                <hr style={{ borderColor: 'var(--border-subtle)', margin: '20px 0' }} />

                {!subscriptionPlan ? (
                    foodTotal > 0 && (
                        <>
                            <div className="flex justify-between mb-2">
                                <span style={{ color: 'var(--text-muted)' }}>Food Total</span>
                                <span>₹{foodTotal}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span style={{ color: 'var(--text-muted)' }}>Platform Fee</span>
                                <span>₹{platformFee}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span style={{ color: 'var(--text-muted)' }}>Delivery Charge</span>
                                <span>₹{deliveryCharge}</span>
                            </div>
                            {cartDiscount > 0 && (
                                <div className="flex justify-between mb-2" style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                                    <span>Cart Offer ({settings.cartDiscountPercentage}% off values {'>'} ₹{settings.cartDiscountThreshold})</span>
                                    <span>- ₹{cartDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <hr style={{ borderColor: 'var(--border)', margin: '15px 0' }} />
                        </>
                    )
                ) : (
                    <div className="flex justify-between mb-2">
                        <span style={{ color: 'var(--text-muted)' }}>Subscription Total</span>
                        <span>₹{subscriptionPlan.price}</span>
                    </div>
                )}

                <hr style={{ borderColor: 'var(--border-subtle)', margin: '20px 0' }} />
                <div className="flex justify-between mb-4" style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>
                    <span>Total Amount</span>
                    <span>₹{subscriptionPlan ? subscriptionPlan.price : (foodTotal > 0 ? totalAmount : 0)}</span>
                </div>



                {distanceError && <div className="mb-4" style={{ color: '#ff4d4d', fontWeight: 'bold', padding: '10px', backgroundColor: 'rgba(255, 77, 77, 0.1)', borderRadius: '8px' }}>{distanceError}</div>}

                <button
                    className="btn btn-primary"
                    onClick={handlePayment}
                    style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}
                >
                    Proceed to Pay (Razorpay)
                </button>
            </div>
            )}
        </div >
    );
};

export default Checkout;
