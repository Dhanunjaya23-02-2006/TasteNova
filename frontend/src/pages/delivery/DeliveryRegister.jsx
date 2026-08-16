import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const DeliveryRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        vehicleType: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.vehicleType) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.phone.length < 10) {
            toast.error('Please enter a valid mobile number');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/users/register-partner`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    vehicleType: formData.vehicleType,
                    role: 'delivery'
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
                <h2 className="text-center mb-4" style={{ color: 'var(--primary)' }}>Join as Delivery Partner</h2>
                <p className="text-center" style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                    Deliver happiness to people's doorsteps and earn on your own schedule.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Full Name</label>
                        <input 
                            type="text" 
                            name="name"
                            className="form-control" 
                            placeholder="John Doe" 
                            value={formData.name}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email</label>
                        <input 
                            type="email" 
                            name="email"
                            className="form-control" 
                            placeholder="john@example.com" 
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
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Vehicle Type</label>
                        <select 
                            name="vehicleType"
                            className="form-control" 
                            value={formData.vehicleType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select vehicle</option>
                            <option value="bike">2-Wheeler (Bike/Scooter)</option>
                            <option value="cycle">Bicycle</option>
                        </select>
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

export default DeliveryRegister;