import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '60px 5% 30px',
            marginTop: 'auto',
            color: 'var(--text-main)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Subtle background glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255, 87, 34, 0.03) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '40px',
                position: 'relative',
                zIndex: 1,
                maxWidth: '1280px',
                margin: '0 auto'
            }}>
                <div className="brand-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <img src="/logo.png" alt="TasteNova Logo" style={{ height: '60px', width: '60px', objectFit: 'contain', borderRadius: '50%', border: '1px solid rgba(212, 175, 55, 0.3)' }} />
                        <span className="gradient-text" style={{ fontSize: '2rem', fontWeight: '800' }}>TasteNova</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '0.95rem', maxWidth: '300px' }}>
                        Delivering home-cooked goodness right to your doorstep. Fresh, hygienic, and made with love by local culinary artists.
                    </p>
                </div>

                <div className="categories-section">
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-main)', fontWeight: '600' }}>Quick Bite Categories</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {['🌶️ Authentic Starters', '🍜 Asian Fusion', '🥘 Premium Biryanis', '🍰 Homemade Desserts'].map((item, index) => (
                            <li key={index}>
                                <Link to="/" style={{ 
                                    color: 'var(--text-muted)', 
                                    textDecoration: 'none', 
                                    transition: 'var(--transition-fast)',
                                    display: 'inline-block'
                                }} 
                                onMouseOver={e => { e.target.style.color = 'var(--primary)'; e.target.style.transform = 'translateX(5px)'; }} 
                                onMouseOut={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.transform = 'translateX(0)'; }}>
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="contact-section">
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-main)', fontWeight: '600' }}>Contact & Support</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <Phone size={18} color="var(--primary)" style={{ marginTop: '3px' }} />
                            <div>
                                <a href="tel:+918639275907" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'var(--transition-fast)' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
                                    +91 86392 75907
                                </a>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <Mail size={18} color="var(--primary)" style={{ marginTop: '3px' }} />
                            <div>
                                <a href="mailto:dhanunjayaambati5@gmail.com" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'var(--transition-fast)' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
                                    dhanunjayaambati5@gmail.com
                                </a>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <MapPin size={18} color="var(--primary)" style={{ marginTop: '3px' }} />
                            <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                HQ: Siddiq Nagar, Gachibowli,<br />Hyderabad, India.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', padding: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} TasteNova Inc. Designed with passion. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
