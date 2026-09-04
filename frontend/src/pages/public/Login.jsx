import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine initial step based on route
    const getInitialStep = () => {
        if (location.pathname === '/register') return 'SIGNUP';
        if (location.pathname === '/forgot-password') return 'FORGOT_PASSWORD';
        if (location.pathname === '/verify-otp') return 'VERIFY_OTP';
        return 'LOGIN';
    };

    const [authStep, setAuthStep] = useState(getInitialStep());
    const [otpTimer, setOtpTimer] = useState(180); // 3 minutes = 180 seconds
    const [canResend, setCanResend] = useState(false);
    const [forgotPasswordTimer, setForgotPasswordTimer] = useState(180);
    const [canResendForgotPassword, setCanResendForgotPassword] = useState(false);

    useEffect(() => {
        setAuthStep(getInitialStep());
    }, [location.pathname]);

    // Form Data State
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: '',
        termsAccepted: false, emailOtp: '', newPassword: '', resetOtp: ''
    });

    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleBack = () => {
        navigate('/login');
        setError('');
    };

    useEffect(() => {
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
                    credentials: 'include',
                    body: JSON.stringify({ email: formData.email, password: formData.password })
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Login Successful!');
                    login(data);
                    if (data.role === 'superadmin') navigate('/superadmin');
                    else if (data.role === 'admin') navigate('/admin');
                    else if (data.role === 'subadmin') navigate('/subadmin');
                    else if (data.role === 'chef') navigate('/chef-dashboard');
                    else navigate('/');
                } else setError(data.message || 'Login failed');

            } else if (authStep === 'SIGNUP') {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match.');
                    return;
                }
                if (!formData.termsAccepted) {
                    setError('Please accept the Terms & Conditions.');
                    return;
                }
                
                // Force role to user for customer signup
                const payload = { ...formData, role: 'user' };

                const res = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Verification Code Sent to Email!');
                    navigate('/verify-otp');
                    setOtpTimer(180);
                    setCanResend(false);
                } else setError(data.message || 'Registration failed');

            } else if (authStep === 'VERIFY_OTP') {
                const payload = { ...formData, role: 'user' };
                const res = await fetch(`${API_URL}/users/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Account Created!');
                    login(data);
                    if (data.role === 'superadmin') navigate('/superadmin');
                    else if (data.role === 'admin') navigate('/admin');
                    else if (data.role === 'subadmin') navigate('/subadmin');
                    else if (data.role === 'chef') navigate('/chef-dashboard');
                    else navigate('/onboarding/location');
                } else setError(data.message || 'Verification failed');

            } else if (authStep === 'FORGOT_PASSWORD') {
                const res = await fetch(`${API_URL}/users/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: formData.email })
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Reset Code Sent!');
                    navigate('/forgot-password'); // or handle internal state
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
                    navigate('/login');
                } else setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 0' }}>
            <div className="animate-fade-up glass-panel" style={{ maxWidth: '450px', width: '100%', transition: 'all 0.5s ease', position: 'relative', padding: '40px', boxShadow: 'var(--shadow-floating)' }}>

                {authStep !== 'LOGIN' && authStep !== 'SIGNUP' && (
                    <button onClick={handleBack} style={{ position: 'absolute', top: '25px', left: '25px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1rem', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        ← Back
                    </button>
                )}

                <h2 className="text-center mb-4" style={{ fontSize: '2.5rem', color: 'var(--text-main)', letterSpacing: '-0.02em', fontWeight: '800', marginTop: (authStep !== 'LOGIN' && authStep !== 'SIGNUP') ? '30px' : '0' }}>
                    {authStep === 'LOGIN' && 'Welcome back to TasteNova'}
                    {authStep === 'SIGNUP' && 'Create your TasteNova account'}
                    {authStep === 'VERIFY_OTP' && 'Verify Mobile OTP'}
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

                            {authStep === 'SIGNUP' && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Mobile Number</label>
                                    <input type="text" name="phone" className="form-control" placeholder="1234567890" value={formData.phone} onChange={handleChange} required />
                                </div>
                            )}

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                                    {authStep === 'LOGIN' ? 'Mobile / Email' : 'Email Address'}
                                </label>
                                <input type="text" name="email" className="form-control" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Password</label>
                                    {authStep === 'LOGIN' && (
                                        <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
                                            Forgot Password?
                                        </Link>
                                    )}
                                </div>
                                <input type="password" name="password" className="form-control" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                            </div>

                            {authStep === 'SIGNUP' && (
                                <>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>Confirm Password</label>
                                        <input type="password" name="confirmPassword" className="form-control" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                                    </div>
                                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" name="termsAccepted" id="terms" checked={formData.termsAccepted} onChange={handleChange} required style={{ width: '18px', height: '18px' }} />
                                        <label htmlFor="terms" style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>I agree to TasteNova's Terms & Conditions</label>
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
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Verification Code</label>
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
                        {authStep === 'LOGIN' && 'Login'}
                        {authStep === 'SIGNUP' && 'Create Account'}
                        {authStep === 'VERIFY_OTP' && 'Verify & Activate'}
                        {authStep === 'FORGOT_PASSWORD' && 'Send Recovery Code'}
                        {authStep === 'RESET_PASSWORD' && 'Confirm New Password'}
                    </button>

                    {(authStep === 'LOGIN' || authStep === 'SIGNUP') && (
                        <p className="text-center mt-4" style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            {authStep === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                            <Link
                                to={authStep === 'LOGIN' ? '/register' : '/login'}
                                style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}
                            >
                                {authStep === 'LOGIN' ? 'Create Customer Account' : 'Login'}
                            </Link>
                        </p>
                    )}
                    
                    {authStep === 'LOGIN' && (
                        <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Are you a home chef?</span>
                                <Link to="/chef/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                                    Join TasteNova →
                                </Link>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
