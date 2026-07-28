import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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

const Login = () => {
    // 'LOGIN', 'SIGNUP', 'VERIFY_OTP', 'FORGOT_PASSWORD', 'RESET_PASSWORD'
    const [authStep, setAuthStep] = useState('LOGIN');
    const [otpTimer, setOtpTimer] = useState(180); // 3 minutes = 180 seconds
    const [canResend, setCanResend] = useState(false);
    const [forgotPasswordTimer, setForgotPasswordTimer] = useState(180);
    const [canResendForgotPassword, setCanResendForgotPassword] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', address: '', role: 'user',
        emailOtp: '', phoneOtp: '', newPassword: '', resetOtp: '', fssaiNumber: '',
        businessName: '', description: '', kitchenImage: '', location: null
    });

    const [error, setError] = useState('');
    const [superadminExists, setSuperadminExists] = useState(false);
    const [adminExists, setAdminExists] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBack = () => {
        setAuthStep('LOGIN');
        setError('');
    };

    React.useEffect(() => {
        const checkRoles = async () => {
            try {
                const res = await fetch(`${API_URL}/users/check-roles`);
                if (!res.ok) {
                    // This handles 429 Too Many Requests cleanly without trying to parse text as JSON
                    return; 
                }
                const data = await res.json();
                setSuperadminExists(data.superadminExists);
                setAdminExists(data.adminExists);
            } catch (err) { console.error(err); }
        };
        checkRoles();
    }, []);

    React.useEffect(() => {
        let timer;
        if (authStep === 'VERIFY_OTP' && otpTimer > 0) {
            timer = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        } else if (authStep === 'VERIFY_OTP' && otpTimer === 0) {
            setCanResend(true);
        }

        let forgotTimer;
        if (authStep === 'RESET_PASSWORD' && forgotPasswordTimer > 0) {
            forgotTimer = setInterval(() => {
                setForgotPasswordTimer((prev) => prev - 1);
            }, 1000);
        } else if (authStep === 'RESET_PASSWORD' && forgotPasswordTimer === 0) {
            setCanResendForgotPassword(true);
        }

        return () => {
            clearInterval(timer);
            clearInterval(forgotTimer);
        };
    }, [authStep, otpTimer, forgotPasswordTimer]);

    const handleResendOtp = async () => {
        if (!canResend) return;
        setError('');
        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('A new OTP has been sent to your email.');
                setOtpTimer(180);
                setCanResend(false);
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const handleResendForgotPasswordOtp = async () => {
        if (!canResendForgotPassword) return;
        setError('');
        try {
            const res = await fetch(`${API_URL}/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: formData.email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('A new recovery code has been sent.');
                setForgotPasswordTimer(180);
                setCanResendForgotPassword(false);
            } else {
                setError(data.message || 'Failed to resend recovery code');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (authStep === 'LOGIN') {
                const res = await fetch(`${API_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, password: formData.password })
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Login Successful!');
                    login(data);
                    if (data.role === 'superadmin') navigate('/superadmin');
                    else if (data.role === 'admin') navigate('/admin');
                    else if (data.role === 'chef') navigate('/chef-dashboard');
                    else if (data.role === 'delivery') navigate('/delivery-dashboard');
                    else navigate('/');
                } else setError(data.message || 'Login failed');

            } else if (authStep === 'SIGNUP') {
                const res = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Verification Code Sent to Email!');
                    setAuthStep('VERIFY_OTP');
                    setOtpTimer(180);
                    setCanResend(false);
                } else setError(data.message || 'Registration failed');

            } else if (authStep === 'VERIFY_OTP') {
                const res = await fetch(`${API_URL}/users/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Account Verified!');
                    login(data);
                    if (data.role === 'superadmin') navigate('/superadmin');
                    else if (data.role === 'admin') navigate('/admin');
                    else if (data.role === 'chef') navigate('/chef-dashboard');
                    else if (data.role === 'delivery') navigate('/delivery-dashboard');
                    else navigate('/');
                } else setError(data.message || 'Verification failed');

            } else if (authStep === 'FORGOT_PASSWORD') {
                const res = await fetch(`${API_URL}/users/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: formData.email }) // Assuming email is entered here
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Reset Code Sent!');
                    setAuthStep('RESET_PASSWORD');
                    setForgotPasswordTimer(180);
                    setCanResendForgotPassword(false);
                } else setError(data.message || 'Failed to send code');

            } else if (authStep === 'RESET_PASSWORD') {
                const res = await fetch(`${API_URL}/users/reset-password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: formData.email, otp: formData.resetOtp, newPassword: formData.newPassword })
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Password Successfully Reset!');
                    setAuthStep('LOGIN');
                } else setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 0' }}>
            <div className="animate-fade-up glass-panel" style={{ maxWidth: authStep === 'SIGNUP' ? '650px' : '450px', width: '100%', transition: 'all 0.5s ease', position: 'relative', padding: '40px', boxShadow: 'var(--shadow-floating)' }}>

                {authStep !== 'LOGIN' && authStep !== 'SIGNUP' && (
                    <button onClick={handleBack} style={{ position: 'absolute', top: '25px', left: '25px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1rem', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        ← Back
                    </button>
                )}

                <h2 className="text-center mb-4" style={{ fontSize: '2.5rem', color: 'var(--text-main)', letterSpacing: '-0.02em', fontWeight: '800', marginTop: (authStep !== 'LOGIN' && authStep !== 'SIGNUP') ? '30px' : '0' }}>
                    {authStep === 'LOGIN' && 'Welcome Back'}
                    {authStep === 'SIGNUP' && 'Join TasteNova'}
                    {authStep === 'VERIFY_OTP' && 'Verify Account'}
                    {authStep === 'FORGOT_PASSWORD' && 'Recover Password'}
                    {authStep === 'RESET_PASSWORD' && 'Set New Password'}
                </h2>

                {error && <div style={{ color: '#ff4757', background: 'rgba(255, 71, 87, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid rgba(255, 71, 87, 0.2)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>

                    {/* --- LOGIN & SIGNUP SHARED FIELDS --- */}
                    {(authStep === 'LOGIN' || authStep === 'SIGNUP') && (
                        <>
                            {authStep === 'SIGNUP' && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Full Name</label>
                                    <input type="text" name="name" className="form-control" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                                </div>
                            )}

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Email Address</label>
                                <input type="email" name="email" className="form-control" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Password</label>
                                    {authStep === 'LOGIN' && (
                                        <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => setAuthStep('FORGOT_PASSWORD')}>
                                            Forgot Password?
                                        </span>
                                    )}
                                </div>
                                <input type="password" name="password" className="form-control" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                            </div>

                            {authStep === 'SIGNUP' && (
                                <>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Account Type</label>
                                        <select name="role" className="form-control" value={formData.role} onChange={handleChange}>
                                            <option value="user" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>Customer (Order Food)</option>
                                            {!superadminExists && <option value="superadmin" style={{ background: 'var(--bg-surface)', color: 'var(--primary)', fontWeight: 'bold' }}>Main Admin (Site Owner)</option>}
                                            {!adminExists && <option value="admin" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>Sub-Admin (Management)</option>}
                                            <option value="chef" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>Home/Cloud Kitchen Owner (Chef)</option>
                                            <option value="delivery" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>Delivery Partner</option>
                                        </select>
                                    </div>
                                    {formData.role === 'chef' && (
                                        <>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Kitchen/Business Name</label>
                                                <input type="text" name="businessName" className="form-control" placeholder="Mom's Magic Kitchen" value={formData.businessName} onChange={handleChange} required />
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Kitchen Description</label>
                                                <textarea name="description" className="form-control" placeholder="Tell us about your kitchen..." value={formData.description} onChange={handleChange} required />
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Kitchen Image URL</label>
                                                <input type="text" name="kitchenImage" className="form-control" placeholder="https://example.com/image.jpg" value={formData.kitchenImage} onChange={handleChange} required />
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>FSSAI Registration Number (Optional for now)</label>
                                                <input type="text" name="fssaiNumber" className="form-control" placeholder="12345678901234" value={formData.fssaiNumber} onChange={handleChange} />
                                                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                                    Don't have one? We can help you register after you sign up.
                                                </small>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Exact Kitchen Location (Drop a pin) *</label>
                                                <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '10px' }}>
                                                    <MapContainer center={formData.location ? [formData.location.lat, formData.location.lng] : [19.0760, 72.8777]} zoom={formData.location ? 15 : 11} style={{ height: '100%', width: '100%' }}>
                                                        <TileLayer url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}" />
                                                        <LocationPicker position={formData.location} setPosition={async (pos) => {
                                                            setFormData(prev => ({...prev, location: pos}));
                                                            const address = await reverseGeocode(pos.lat, pos.lng);
                                                            if (address) {
                                                                setFormData(prev => ({...prev, address: address}));
                                                            }
                                                        }} />
                                                    </MapContainer>
                                                </div>
                                                {formData.location ? (
                                                    <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>✓ Kitchen location captured</span>
                                                ) : (
                                                    <span style={{ color: 'var(--secondary-color)', fontSize: '0.85rem' }}>⚠ Please tap on the map to set your kitchen's exact location</span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Phone</label>
                                        <input type="text" name="phone" className="form-control" placeholder="1234567890" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Address</label>
                                        <input type="text" name="address" className="form-control" placeholder="Your Address" value={formData.address} onChange={handleChange} required />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* --- VERIFY OTP STEP --- */}
                    {authStep === 'VERIFY_OTP' && (
                        <>
                            <p className="text-center mb-4" style={{ color: 'var(--text-muted)' }}>We sent a 6-digit code to your email address.</p>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Verification Code</label>
                                <input type="text" name="emailOtp" className="form-control" placeholder="000000" style={{ letterSpacing: '12px', textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold' }} value={formData.emailOtp} onChange={handleChange} required maxLength="6" />
                            </div>
                            <div className="text-center mt-3" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {canResend ? (
                                    <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleResendOtp}>
                                        Resend OTP
                                    </span>
                                ) : (
                                    <span>Resend OTP in <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span></span>
                                )}
                            </div>
                        </>
                    )}

                    {/* --- FORGOT PASSWORD STEP --- */}
                    {authStep === 'FORGOT_PASSWORD' && (
                        <>
                            <p className="text-center mb-4" style={{ color: 'var(--text-muted)' }}>Enter your registered email or phone number. We'll send a secure recovery code.</p>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Email or Phone</label>
                                <input type="text" name="email" className="form-control" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                            </div>
                        </>
                    )}

                    {/* --- RESET PASSWORD STEP --- */}
                    {authStep === 'RESET_PASSWORD' && (
                        <>
                            <p className="text-center mb-4" style={{ color: 'var(--text-muted)' }}>Enter the recovery code sent to you, along with your new password.</p>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Recovery Code</label>
                                <input type="text" name="resetOtp" className="form-control" placeholder="000000" style={{ letterSpacing: '12px', textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold' }} value={formData.resetOtp} onChange={handleChange} required maxLength="6" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>New Password</label>
                                <input type="password" name="newPassword" className="form-control" placeholder="••••••••" value={formData.newPassword} onChange={handleChange} required />
                            </div>
                            <div className="text-center mt-3" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {canResendForgotPassword ? (
                                    <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleResendForgotPasswordOtp}>
                                        Resend Code
                                    </span>
                                ) : (
                                    <span>Resend Code in <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{Math.floor(forgotPasswordTimer / 60)}:{(forgotPasswordTimer % 60).toString().padStart(2, '0')}</span></span>
                                )}
                            </div>
                        </>
                    )}

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '18px', fontSize: '1.2rem' }}>
                        {authStep === 'LOGIN' && 'Log In Securely'}
                        {authStep === 'SIGNUP' && 'Create Account'}
                        {authStep === 'VERIFY_OTP' && 'Verify & Activate'}
                        {authStep === 'FORGOT_PASSWORD' && 'Send Recovery Code'}
                        {authStep === 'RESET_PASSWORD' && 'Confirm New Password'}
                    </button>

                    {(authStep === 'LOGIN' || authStep === 'SIGNUP') && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
                                <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                                <span style={{ padding: '0 15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Or continue with</span>
                                <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }} onClick={() => toast('Google Sign-In integration required Google Cloud Keys. UI complete!')}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Google
                                </button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }} onClick={() => toast('Twitter/X OAuth integration requires Developer API Keys. UI complete!')}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    Twitter
                                </button>
                            </div>

                            <p className="text-center mt-4" style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                {authStep === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                                <span
                                    style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}
                                    onClick={() => { setAuthStep(authStep === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(''); }}
                                >
                                    {authStep === 'LOGIN' ? 'Sign up' : 'Login'}
                                </span>
                            </p>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
