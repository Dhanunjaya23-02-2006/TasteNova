import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const AboutUs = () => {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_URL}/content/about-us`);
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
        <div className="container" style={{ paddingTop: '60px', maxWidth: '800px' }}>
            <h1 className="hero-heading text-center" style={{ marginBottom: '40px' }}>About TasteNova</h1>
            
            {pageData && pageData.content ? (
                <div style={{ background: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }} dangerouslySetInnerHTML={{ __html: pageData.content }} />
            ) : (
                <div style={{ background: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Our Mission</h3>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
                        TasteNova was born from a simple idea: everyone deserves access to authentic, wholesome, and hygienic home-cooked meals. 
                        We are on a mission to empower talented home-makers and amateur chefs by providing them a platform to share their culinary magic, 
                        while giving customers a healthy alternative to commercial restaurant food.
                    </p>

                    <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>The Problem We Solve</h3>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '40px' }}>
                        Working professionals and students often rely on restaurant food, which can be oily, expensive, and lacking the "made with love" touch. 
                        Simultaneously, there are millions of talented individuals cooking incredible meals in their homes with no easy way to monetize their skills.
                        TasteNova bridges this gap.
                    </p>

                    <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Our Promise</h3>
                    <ul style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '20px' }}>
                        <li>100% verified home kitchens.</li>
                        <li>Strict hygiene and quality checks.</li>
                        <li>Freshly prepared, preservative-free food.</li>
                        <li>Transparent pricing that supports local creators.</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AboutUs;