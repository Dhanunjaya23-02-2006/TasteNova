import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Smartphone, Banknote, ShieldCheck, CheckCircle, AlertCircle, ArrowLeft, Trash2, Edit2, Plus, Minus, X, Clock, Star, ShoppingCart } from 'lucide-react';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const Checkout = () => {
    const { user } = useContext(AuthContext);
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [chefLocation, setChefLocation] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [distanceError, setDistanceError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi', 'cod', 'wallets'

    // Mock Payment Form States
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [upiId, setUpiId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [deliveryInstructions, setDeliveryInstructions] = useState('');

    const platformFee = 20;
    const originalDeliveryCharge = 60;
    const deliveryCharge = 40; // Simulated discount as per image
    const itemTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const grandTotal = itemTotal + platformFee + deliveryCharge;
    const totalItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const firstItem = cartItems.length > 0 ? cartItems[0] : null;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (cartItems.length === 0 && !orderSuccess) {
            // We handle empty cart in the render below
        }

        if (user?.addresses && user.addresses.length > 0) {
            setSelectedAddress(user.addresses[0]);
        }

        const fetchChefLocation = async () => {
            try {
                const chefId = cartItems.length > 0 && cartItems[0].chef ? (cartItems[0].chef._id || cartItems[0].chef) : '';
                if (!chefId) return;

                const res = await fetch(`${API_URL}/users/admin-location?chefId=${chefId}`);
                const data = await res.json();
                if (data && data.lat) {
                    setChefLocation(data);
                }
            } catch (error) {
                console.error("Failed to fetch kitchen location", error);
            }
        };

        fetchChefLocation();
    }, [user, cartItems, navigate, orderSuccess]);

    const handleAddressSelect = (addr) => {
        setSelectedAddress(addr);

        if (chefLocation) {
            const d = calculateDistance(addr.location.lat, addr.location.lng, chefLocation.lat, chefLocation.lng);
            if (d > 6) {
                setDistanceError(`This address is ${d.toFixed(1)}km away from the kitchen. We only deliver within 6km.`);
            } else {
                setDistanceError('');
            }
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!selectedAddress) {
            return toast.error("Please select a delivery address.");
        }
        if (distanceError) {
            return toast.error("Cannot proceed: Delivery address is out of range.");
        }

        // Mock Validation
        if (paymentMethod === 'card' && (cardNumber.length < 16 || expiry.length < 5 || cvv.length < 3)) {
            return toast.error("Please enter valid card details.");
        }
        if (paymentMethod === 'upi' && !upiId.includes('@')) {
            return toast.error("Please enter a valid UPI ID.");
        }

        setIsProcessing(true);

        try {
            // Formatting Order Items
            const formattedItems = cartItems.map(item => ({
                menuItem: item._id,
                qty: item.qty,
                price: item.price
            }));

            const orderPayload = {
                orderItems: formattedItems,
                shippingAddress: {
                    address: selectedAddress.streetAddress,
                    lat: selectedAddress.location.lat,
                    lng: selectedAddress.location.lng
                },
                paymentMethod: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery',
                itemsPrice: itemTotal,
                platformFee: platformFee,
                deliveryCharge: deliveryCharge,
                totalPrice: grandTotal,
                orderType: 'Instant'
            };

            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (res.ok) {
                setIsProcessing(false);
                setOrderSuccess(true);
                clearCart();

                toast.success("Order Placed Successfully!");

                setTimeout(() => {
                    navigate('/account/orders');
                }, 3000);
            } else {
                const data = await res.json();
                throw new Error(data.message || "Failed to place order");
            }

        } catch (err) {
            setIsProcessing(false);
            toast.error(err.message || "An error occurred during payment.");
        }
    };

    if (orderSuccess) {
        return (
            <div className="container mt-5 mb-5" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="animate-fade-up" style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle size={48} />
                    </div>
                    <h2 style={{ fontSize: '2rem', color: '#1a1a1a', marginBottom: '16px', fontWeight: 800 }}>Payment Successful!</h2>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '32px' }}>
                        Your order has been placed securely. The kitchen will start preparing it shortly.
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#006400', fontWeight: 600 }}>Redirecting to your orders...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mt-5 mb-5" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="animate-fade-up" style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                    <div style={{ width: '120px', height: '120px', background: 'rgba(0, 100, 0, 0.1)', color: 'var(--primary-color, #006400)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px' }}>
                        <ShoppingCart size={64} strokeWidth={1.5} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', color: '#1a1a1a', marginBottom: '16px', fontWeight: 800 }}>Your cart is empty</h2>
                    <p style={{ color: '#666', fontSize: '1rem', marginBottom: '32px' }}>
                        Looks like you haven't added any delicious home-cooked meals to your cart yet.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: 'var(--primary-color, #006400)', color: '#fff', padding: '14px 32px', borderRadius: '12px', border: 'none', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0, 100, 0, 0.3)' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Browse Kitchens
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#fafafa', minHeight: '100vh', padding: '20px 0', fontFamily: "'Inter', sans-serif" }}>
            <style>
                {`
                .checkout-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                .stepper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #999;
                    font-size: 0.9rem;
                }
                .stepper .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                }
                .stepper .step .circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #eee;
                    color: #999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .stepper .step.active .circle {
                    background: #006400;
                    color: #fff;
                }
                .stepper .step.active span {
                    color: #006400;
                    font-weight: 600;
                }
                .stepper .line {
                    height: 2px;
                    width: 40px;
                    background: #eee;
                    margin-bottom: 20px;
                }
                .section-card {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    padding: 24px;
                    margin-bottom: 24px;
                }
                .section-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 20px;
                }
                .cart-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 0;
                    border-bottom: 1px solid #eee;
                }
                .cart-item:last-child {
                    border-bottom: none;
                }
                .cart-item-info {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    flex: 1;
                }
                .cart-item-img {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    object-fit: cover;
                }
                .qty-control {
                    display: flex;
                    align-items: center;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    overflow: hidden;
                }
                .qty-btn {
                    width: 28px;
                    height: 28px;
                    background: #fff;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #666;
                }
                .qty-val {
                    width: 28px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .address-card {
                    border: 1px solid #eee;
                    border-radius: 8px;
                    padding: 16px;
                    cursor: pointer;
                    position: relative;
                }
                .address-card.selected {
                    border-color: #006400;
                    background: #f0fdf4;
                }
                .address-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 8px;
                }
                .address-radio {
                    accent-color: #006400;
                }
                .edit-btn {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    color: #666;
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                }
                .payment-tabs {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    border-right: 1px solid #eee;
                    padding-right: 20px;
                }
                .payment-tab {
                    padding: 12px 16px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    font-weight: 500;
                    color: #666;
                    text-align: left;
                }
                .payment-tab.active {
                    background: #f0fdf4;
                    color: #006400;
                }
                .payment-content {
                    flex: 1;
                    padding-left: 20px;
                }
                .form-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    outline: none;
                    margin-top: 6px;
                }
                .form-input:focus {
                    border-color: #006400;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    color: #555;
                    font-size: 0.95rem;
                }
                .btn-primary-green {
                    background: #006400;
                    color: #fff;
                    width: 100%;
                    padding: 16px;
                    border-radius: 8px;
                    border: none;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                }
                .btn-primary-green:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                /* Mobile Adjustments */
                @media (max-width: 768px) {
                    .stepper .step span {
                        font-size: 0.75rem;
                    }
                    .stepper .line {
                        width: 20px;
                    }
                    .cart-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .cart-item-info {
                        width: 100%;
                    }
                    .cart-item > div:not(.cart-item-info):not(button) {
                        width: auto;
                        text-align: left;
                    }
                    .cart-item > button {
                        position: absolute;
                        top: 16px;
                        right: 0;
                    }
                    .cart-item {
                        position: relative;
                    }
                    .payment-tabs {
                        flex-direction: row;
                        border-right: none;
                        border-bottom: 1px solid #eee;
                        padding-right: 0;
                        padding-bottom: 12px;
                        overflow-x: auto;
                        white-space: nowrap;
                    }
                    .payment-content {
                        padding-left: 0;
                        padding-top: 16px;
                    }
                }
                `}
            </style>

            <div className="checkout-container">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            Checkout
                        </h1>
                        <p style={{ color: '#006400', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: 500 }}>
                            <ShieldCheck size={14} /> Your data is safe and secure with us.
                        </p>
                    </div>

                    <div className="stepper">
                        <div className="step active">
                            <div className="circle">1</div>
                            <span>Cart</span>
                        </div>
                        <div className="line"></div>
                        <div className="step">
                            <div className="circle">2</div>
                            <span>Address</span>
                        </div>
                        <div className="line"></div>
                        <div className="step">
                            <div className="circle">3</div>
                            <span>Payment</span>
                        </div>
                        <div className="line"></div>
                        <div className="step">
                            <div className="circle">4</div>
                            <span>Review</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Left Column */}
                    <div style={{ flex: '1 1 650px', display: 'flex', flexDirection: 'column' }}>

                        {/* 1. Your Cart */}
                        <div className="section-card">
                            <h2 className="section-title">1. Your Cart <span style={{ color: '#888', fontWeight: 400, fontSize: '0.95rem' }}>({totalItemsCount} items)</span></h2>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {cartItems.map((item) => (
                                    <div key={item._id} className="cart-item">
                                        <div className="cart-item-info">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                            ) : (
                                                <div className="cart-item-img" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>No Img</span>
                                                </div>
                                            )}
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600, color: '#333' }}>{item.name}</h4>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#666' }}>{item.chef?.name || 'Kitchen'}</p>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: item.type === 'Veg' ? '#006400' : '#d32f2f' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.type === 'Veg' ? '#006400' : '#d32f2f' }}></span>
                                                    {item.type || 'Veg'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ width: '100px', fontWeight: 600 }}>₹{item.price}</div>

                                        <div className="qty-control">
                                            <button className="qty-btn" onClick={() => updateQuantity(item._id, -1)} disabled={item.qty <= 1}>
                                                <Minus size={14} />
                                            </button>
                                            <span className="qty-val">{item.qty}</span>
                                            <button className="qty-btn" onClick={() => updateQuantity(item._id, 1)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div style={{ width: '100px', textAlign: 'right', fontWeight: 600 }}>₹{item.price * item.qty}</div>

                                        <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: '8px' }}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.9rem' }}>
                                    <Clock size={16} /> Prep time: 20-40 mins
                                </div>
                                <button onClick={clearCart} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #006400', color: '#006400', padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
                                    <Trash2 size={16} /> Clear Cart
                                </button>
                            </div>
                        </div>

                        {/* 2. Delivery Address */}
                        <div className="section-card">
                            <h2 className="section-title">2. Delivery Address</h2>

                            {user?.addresses && user.addresses.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                                    {user.addresses.map((addr, idx) => {
                                        const labels = ['Home', 'Work', 'Parents Home'];
                                        const label = addr.label || labels[idx % labels.length];
                                        return (
                                            <div key={addr._id} className={`address-card ${selectedAddress?._id === addr._id ? 'selected' : ''}`} onClick={() => handleAddressSelect(addr)}>
                                                <div className="address-label">
                                                    <input type="radio" className="address-radio" checked={selectedAddress?._id === addr._id} readOnly />
                                                    {label}
                                                    {idx === 0 && <span style={{ fontSize: '0.65rem', background: '#e8f5e9', color: '#006400', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>DEFAULT</span>}
                                                </div>
                                                <button className="edit-btn" onClick={(e) => { e.stopPropagation(); navigate('/account/addresses'); }}><Edit2 size={12} /> Edit</button>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#555', lineHeight: '1.4' }}>
                                                    {addr.streetAddress}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>+91 {user.phone || '98765 43210'}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc', textAlign: 'center', marginBottom: '16px' }}>
                                    <p style={{ color: '#555', marginBottom: '12px' }}>You haven't saved any delivery addresses.</p>
                                    <button onClick={() => navigate('/account/addresses')} style={{ background: '#006400', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                                        + Add New Address
                                    </button>
                                </div>
                            )}

                            {distanceError && (
                                <div style={{ padding: '12px 16px', background: '#ffebee', borderRadius: '8px', color: '#d32f2f', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} /> {distanceError}
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Delivery Instructions (Optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="E.g. Please leave at the door, Ring the bell, etc."
                                    value={deliveryInstructions}
                                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                                    style={{ background: '#f9f9f9', border: 'none', padding: '14px', borderRadius: '8px' }}
                                />
                            </div>

                            <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', color: '#006400', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500 }}>
                                <Clock size={16} /> Expected delivery time: 30-40 mins
                            </div>
                        </div>

                        {/* 3. Payment Method */}
                        <div className="section-card" style={{ opacity: (!selectedAddress || distanceError) ? 0.6 : 1, pointerEvents: (!selectedAddress || distanceError) ? 'none' : 'auto' }}>
                            <h2 className="section-title">3. Payment Method</h2>

                            <div style={{ display: 'flex' }}>
                                <div className="payment-tabs">
                                    <button className={`payment-tab ${paymentMethod === 'upi' ? 'active' : ''}`} onClick={() => setPaymentMethod('upi')}>
                                        <span style={{ border: '1px solid currentColor', borderRadius: '4px', padding: '2px 4px', fontSize: '0.6rem', fontWeight: 'bold' }}>UPI</span> UPI
                                    </button>
                                    <button className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
                                        <CreditCard size={18} /> Cards
                                    </button>
                                    <button className={`payment-tab ${paymentMethod === 'wallets' ? 'active' : ''}`} onClick={() => setPaymentMethod('wallets')}>
                                        <Smartphone size={18} /> Wallets
                                    </button>
                                    <button className={`payment-tab ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                                        <Banknote size={18} /> COD
                                    </button>
                                </div>

                                <div className="payment-content">
                                    {paymentMethod === 'card' && (
                                        <div>
                                            <div style={{ marginBottom: '24px' }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Card Number</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input type="text" className="form-input" placeholder="4242 4242 4242 4242" maxLength="16" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))} style={{ margin: 0, border: 'none', borderBottom: '1px solid #ddd', borderRadius: 0, padding: '8px 0', background: 'transparent' }} />
                                                    <span style={{ color: '#1a1f71', fontWeight: 800, fontSize: '0.8rem', fontStyle: 'italic' }}>VISA</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Expiry Date</label>
                                                        <input type="text" className="form-input" placeholder="MM / YY" maxLength="5" value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{ margin: 0, border: 'none', borderBottom: '1px solid #ddd', borderRadius: 0, padding: '8px 0', background: 'transparent' }} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>CVV</label>
                                                        <input type="password" className="form-input" placeholder="123" maxLength="3" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} style={{ margin: 0, border: 'none', borderBottom: '1px solid #ddd', borderRadius: 0, padding: '8px 0', background: 'transparent' }} />
                                                    </div>
                                                    <div style={{ flex: 2 }}>
                                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Name on Card</label>
                                                        <input type="text" className="form-input" placeholder="Ambati Dhanunjaya" style={{ margin: 0, border: 'none', borderBottom: '1px solid #ddd', borderRadius: 0, padding: '8px 0', background: 'transparent' }} />
                                                    </div>
                                                </div>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '0.85rem', color: '#555', cursor: 'pointer' }}>
                                                    <input type="checkbox" defaultChecked style={{ accentColor: '#006400' }} /> Save this card securely
                                                </label>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ border: '1px solid #006400', background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '4px solid #006400' }}></div>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>Visa ending with 4242</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>Expires 12/26</div>
                                                        </div>
                                                    </div>
                                                    <span style={{ color: '#1a1f71', fontWeight: 800, fontSize: '0.8rem', fontStyle: 'italic' }}>VISA</span>
                                                </div>
                                                <div style={{ border: '1px solid #eee', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #ccc' }}></div>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>Mastercard ending with 5555</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>Expires 10/25</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex' }}>
                                                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#eb001b', zIndex: 2 }}></div>
                                                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#f79e1b', marginLeft: '-6px', zIndex: 1 }}></div>
                                                    </div>
                                                </div>

                                                <button style={{ border: '1px dashed #006400', background: 'none', color: '#006400', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                                    <Plus size={16} /> Add New Card
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'upi' && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', marginBottom: '8px', fontWeight: 600 }}>Enter UPI ID</label>
                                            <input type="text" className="form-input" placeholder="example@okhdfcbank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                                        </div>
                                    )}

                                    {paymentMethod === 'cod' && (
                                        <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#006400' }}>
                                            <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Banknote size={20} /> Pay on Delivery</h4>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>You can pay via Cash or UPI when the delivery arrives.</p>
                                        </div>
                                    )}
                                    {paymentMethod === 'wallets' && (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                            <Smartphone size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                                            <p>Wallets coming soon.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px', alignSelf: 'flex-start', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>

                        {/* 4. Order Summary */}
                        <div className="section-card" style={{ marginBottom: 0 }}>
                            <h2 className="section-title">4. Order Summary</h2>

                            <div style={{ background: '#f0fdf4', color: '#006400', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                <span>🎉</span> Yoy! You saved ₹{originalDeliveryCharge - deliveryCharge} on delivery fee
                            </div>

                            <div className="summary-row">
                                <span>Item Total ({totalItemsCount} items)</span>
                                <span style={{ fontWeight: 600, color: '#333' }}>₹{itemTotal}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Fee</span>
                                <div>
                                    <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px', fontSize: '0.85rem' }}>₹{originalDeliveryCharge}</span>
                                    <span style={{ fontWeight: 600, color: '#333' }}>₹{deliveryCharge}</span>
                                </div>
                            </div>
                            <div className="summary-row">
                                <span>Platform Fee</span>
                                <span style={{ fontWeight: 600, color: '#333' }}>₹{platformFee}</span>
                            </div>

                            <div style={{ borderTop: '1px solid #eee', margin: '16px 0' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333' }}>To Pay</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#006400' }}>₹{grandTotal}</span>
                            </div>

                            <button
                                className="btn-primary-green"
                                onClick={handlePlaceOrder}
                                disabled={isProcessing || !selectedAddress || distanceError}
                            >
                                {isProcessing ? 'Processing...' : 'Proceed to Payment'} →
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#666', fontSize: '0.8rem', marginTop: '12px' }}>
                                <ShieldCheck size={14} /> 100% Secure Payments
                            </div>

                            <div style={{ background: '#fff9e6', border: '1px dashed #f5c518', padding: '12px', borderRadius: '8px', marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ background: '#f5c518', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>₹</div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b28900' }}>Earn 61 TasteNova Cash on this order</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>Use your cash on next orders and save more!</div>
                                </div>
                            </div>
                        </div>

                        {/* Order Overview */}
                        <div className="section-card">
                            <h2 className="section-title">Order Overview</h2>

                            {firstItem && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '1.2rem' }}>🧑‍🍳</span>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>{firstItem.chef?.name || 'Kitchen'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#f5c518', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Star size={12} fill="#f5c518" /> 4.8 <span style={{ color: '#999' }}>(1280+ ratings)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#006400', fontWeight: 600, cursor: 'pointer' }}>View Menu</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#333', marginBottom: '16px' }}>
                                <span>{totalItemsCount} Items</span>
                                <span style={{ fontWeight: 600 }}>₹{itemTotal}</span>
                            </div>

                            <div style={{ borderTop: '1px solid #eee', margin: '16px 0' }}></div>

                            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Delivery To</div>
                                    <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: 500 }}>
                                        {selectedAddress ? `${selectedAddress.label || 'Home'} (${selectedAddress.streetAddress.substring(0, 30)}...)` : 'Not Selected'}
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#006400', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/account/addresses')}>Change</span>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>Delivery Time</div>
                                <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: 600 }}>30-40 mins</div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>We Accept</div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ padding: '4px 8px', border: '1px solid #eee', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, color: '#1a1f71', fontStyle: 'italic' }}>VISA</div>
                                    <div style={{ padding: '4px 8px', border: '1px solid #eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eb001b', zIndex: 2 }}></div>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f79e1b', marginLeft: '-4px', zIndex: 1 }}></div>
                                    </div>
                                    <div style={{ padding: '4px 8px', border: '1px solid #eee', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, color: '#ff6600' }}>RuPay</div>
                                    <div style={{ padding: '4px 8px', border: '1px solid #eee', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, color: '#333' }}>UPI</div>
                                    <div style={{ padding: '4px 8px', border: '1px solid #eee', borderRadius: '4px', fontSize: '0.7rem', color: '#666' }}>+5</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
