import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Users, ShieldCheck } from 'lucide-react';
import { API_URL } from '../../config';

const ForChefs = () => {
    const navigate = useNavigate();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_URL}/content/for-chefs`);
                if (res.ok) {
                    setPageData(await res.json());
                }
            } catch (error) {
                console.error("Error fetching content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) return <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '60px' }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px' }}>
                <h1 className="hero-heading">Turn your passion for cooking into a thriving business.</h1>
                <p className="hero-subtext" style={{ margin: '0 auto 30px' }}>Join TasteNova as a Home Chef. Cook from your own kitchen, set your own hours, and share your culinary heritage with your city.</p>
                <button onClick={() => navigate('/chef/register')} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Apply as a Chef Today</button>
            </div>

            {pageData && pageData.content ? (
                <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                    <div style={{ background: 'var(--bg-surface)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <DollarSign size={40} color="var(--primary)" style={{ marginBottom: '20px' }} />
                        <h3>Earn from Home</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Monetize your cooking skills without the overhead of opening a restaurant.</p>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <Clock size={40} color="var(--primary)" style={{ marginBottom: '20px' }} />
                        <h3>Flexible Hours</h3>
                        <p style={{ color: 'var(--text-muted)' }}>You decide when you want to cook. Open your kitchen only when you have the time.</p>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <Users size={40} color="var(--primary)" style={{ marginBottom: '20px' }} />
                        <h3>We Handle Logistics</h3>
                        <p style={{ color: 'var(--text-muted)' }}>You focus on cooking; our platform handles marketing, orders, and delivery.</p>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <ShieldCheck size={40} color="var(--primary)" style={{ marginBottom: '20px' }} />
                        <h3>Trust & Support</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Get access to packaging materials, hygiene training, and 24/7 partner support.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForChefs;