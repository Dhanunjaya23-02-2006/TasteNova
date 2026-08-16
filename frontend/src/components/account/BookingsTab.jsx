import React from 'react';
import { CalendarCheck, Users, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingsTab = () => {
    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(252, 128, 25, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
                    <PartyPopper size={40} />
                </div>
                <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '12px' }}>Party Bulk Bookings</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                    Hosting a get-together, office lunch, or family function? Let our expert home chefs handle the food!
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <Users size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '8px' }}>Serve 10 to 100+</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Customized quantities tailored to your exact guest count.</p>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <CalendarCheck size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '8px' }}>Pre-Book Delivery</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Schedule deliveries days or weeks in advance for peace of mind.</p>
                </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(252, 128, 25, 0.1), rgba(252, 128, 25, 0.05))', borderRadius: '16px', padding: '32px', border: '1px solid rgba(252, 128, 25, 0.2)', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '16px' }}>Ready to plan your event?</h3>
                <p style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '24px' }}>Our bulk order experts will help you curate the perfect menu.</p>
                
                <button className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600 }}>
                    Request a Quote
                </button>
                <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>We usually respond within 2 hours.</p>
            </div>

        </div>
    );
};

export default BookingsTab;
