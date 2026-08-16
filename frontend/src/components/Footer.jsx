import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', padding: '60px 0 30px', marginTop: 'auto' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', paddingBottom: '0' }}>
                
                {/* Brand */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--text-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', border: '2px solid var(--primary)' }}>
                            T
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: "'DM Serif Display', serif" }}>TasteNova</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
                        Connecting you with talented home chefs who cook with love and deliver happiness to your doorstep.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Instagram size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Facebook size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)' }}><Twitter size={20} /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link to="/about" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>About Us</Link></li>
                        <li><Link to="/how-it-works" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>How It Works</Link></li>
                        <li><Link to="/for-chefs" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>For Chefs</Link></li>
                        <li><Link to="/cities" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Cities We Serve</Link></li>
                        <li><Link to="/contact" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Contact Us</Link></li>
                    </ul>
                </div>

                {/* For Chefs */}
                <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>For Chefs</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link to="/chef/register" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Become a Chef</Link></li>
                        <li><Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Chef Login</Link></li>
                        <li><Link to="/resources" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Resources</Link></li>
                        <li><Link to="/support" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Help & Support</Link></li>
                    </ul>
                </div>

                {/* Contact Us */}
                <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>Contact Us</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            <Phone size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                            +91 86392 75907
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            <Mail size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                            support@tastenova.in
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            <MapPin size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                            HQ: Siddiq Nagar, Gachibowli, Hyderabad, Telangana, India.
                        </li>
                    </ul>
                </div>

            </div>

            <div className="container" style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '40px', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', paddingBottom: '0' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>© 2026 TasteNova. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Privacy Policy</a>
                    <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Terms & Conditions</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;