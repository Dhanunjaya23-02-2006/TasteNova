import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const ChefRegister = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        cuisine: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.city) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.phone.length < 10) {
            toast.error('Please enter a valid mobile number');
            return;
        }

        setLoading(true);

        try {
            const searchParams = new URLSearchParams(location.search);
            const refCode = searchParams.get('ref');

            const res = await fetch(`${API_URL}/users/register-partner`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    city: formData.city,
                    description: formData.cuisine,
                    role: 'chef',
                    referredBy: refCode
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Application submitted successfully! Our team will verify your account.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            toast.error('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 0' }}>
            <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
                <h2 className="text-center mb-4" style={{ color: 'var(--primary)' }}>Partner as a Home Chef</h2>
                <p className="text-center" style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                    Join our network of culinary creators. Please provide your details, and our onboarding team will contact you for kitchen verification.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>First Name</label>
                            <input 
                                type="text" 
                                name="firstName"
                                className="form-control" 
                                placeholder="Jane" 
                                value={formData.firstName}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Last Name</label>
                            <input 
                                type="text" 
                                name="lastName"
                                className="form-control" 
                                placeholder="Doe" 
                                value={formData.lastName}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email</label>
                        <input 
                            type="email" 
                            name="email"
                            className="form-control" 
                            placeholder="jane@example.com" 
                            value={formData.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Password</label>
                        <input 
                            type="password" 
                            name="password"
                            className="form-control" 
                            placeholder="Create a password" 
                            value={formData.password}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mobile Number</label>
                        <input 
                            type="text" 
                            name="phone"
                            className="form-control" 
                            placeholder="+91 00000 00000" 
                            value={formData.phone}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>City</label>
                        <select 
                            name="city"
                            className="form-control" 
                            value={formData.city}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select your city</option>
                            <option value="hyderabad">Hyderabad</option>
                            <option value="bengaluru">Bengaluru</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Specialty Cuisine (Optional)</label>
                        <input 
                            type="text" 
                            name="cuisine"
                            className="form-control" 
                            placeholder="e.g., Andhra, Maharashtrian, Baking" 
                            value={formData.cuisine}
                            onChange={handleChange}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '14px', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p style={{ color: 'var(--text-muted)' }}>Already a partner? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ChefRegister;