import React, { useState, useEffect } from 'react';
import { MapPin, ChefHat, ShoppingBag, Bike } from 'lucide-react';
import { API_URL } from '../../config';

const HowItWorks = () => {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_URL}/content/how-it-works`);
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
            <h1 className="hero-heading text-center" style={{ marginBottom: '60px' }}>How TasteNova Works</h1>
            
            {pageData && pageData.content ? (
                <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
                    <div className="text-center" style={{ padding: '30px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: '80px', height: '80px', background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <MapPin size={40} color="#2E7D32" />
                        </div>
                        <h3>1. Set Location</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Enter your address to find talented home chefs cooking near your neighborhood.</p>
                    </div>
                    
                    <div className="text-center" style={{ padding: '30px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: '80px', height: '80px', background: '#FFF3E0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <ChefHat size={40} color="#EF6C00" />
                        </div>
                        <h3>2. Choose a Chef</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Browse authentic menus, check ratings, and select dishes prepared with love.</p>
                    </div>

                    <div className="text-center" style={{ padding: '30px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: '80px', height: '80px', background: '#F3E5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <ShoppingBag size={40} color="#6A1B9A" />
                        </div>
                        <h3>3. Place Order</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Checkout securely. The chef starts preparing your food fresh from scratch.</p>
                    </div>

                    <div className="text-center" style={{ padding: '30px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: '80px', height: '80px', background: '#FCE4EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Bike size={40} color="#C2185B" />
                        </div>
                        <h3>4. Fast Delivery</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Our delivery partners bring the hot, hygienic food straight to your doorstep.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HowItWorks;