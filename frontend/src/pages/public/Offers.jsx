import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { Tag, Copy, CheckCircle2, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch(`${API_URL}/offers/public`);
                if (res.ok) {
                    const data = await res.json();
                    setOffers(data);
                } else {
                    toast.error("Failed to load offers");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error connecting to server");
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Coupon code ${code} copied!`);
        setTimeout(() => setCopiedCode(null), 3000);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <main className="container mt-4 mb-5 animate-fade-up" style={{ minHeight: '60vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                <div style={{ background: 'rgba(252, 128, 25, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent)' }}>
                    <Tag size={28} />
                </div>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Special Offers</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Exclusive deals just for you.</p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }}></div>
                    ))}
                </div>
            ) : offers.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {offers.map(offer => (
                        <div key={offer._id} style={{
                            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(252, 128, 25, 0.03) 100%)',
                            borderRadius: '16px',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: 'var(--shadow-card)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex'
                        }}>
                            {/* Left Side (Decorative) */}
                            <div style={{ 
                                width: '30px', 
                                background: 'var(--accent)', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'space-around', 
                                alignItems: 'center',
                                borderRight: '2px dashed rgba(255,255,255,0.5)'
                            }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{ width: '12px', height: '12px', background: 'var(--bg-card)', borderRadius: '50%', marginLeft: '-6px' }}></div>
                                ))}
                            </div>
                            
                            {/* Main Content */}
                            <div style={{ padding: '24px', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 700 }}>
                                            {offer.discountType === 'percentage' ? `${offer.discountPercentage}% OFF` : `₹${offer.discountFlat} OFF`}
                                        </h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {offer.title || offer.description}
                                        </p>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle2 size={12} color="var(--primary)" /> 
                                        Up to ₹{offer.maxDiscountAmount} | Min Order ₹{offer.minOrderValue}
                                    </span>
                                    {offer.scope === 'City' && offer.city && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={12} color="var(--primary)" /> 
                                            Valid only in {offer.city.name}
                                        </span>
                                    )}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={12} color="var(--warning)" /> 
                                        Valid till {formatDate(offer.validUntil)}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ 
                                        flex: 1, 
                                        background: 'rgba(252, 128, 25, 0.1)', 
                                        padding: '10px 16px', 
                                        borderRadius: '8px', 
                                        fontFamily: 'monospace', 
                                        fontWeight: 'bold', 
                                        color: 'var(--accent)',
                                        fontSize: '1.1rem',
                                        letterSpacing: '2px',
                                        textAlign: 'center',
                                        border: '1px dashed var(--accent)'
                                    }}>
                                        {offer.code}
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(offer.code)}
                                        className={`btn ${copiedCode === offer.code ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ padding: '10px 16px', border: copiedCode === offer.code ? 'none' : '1px solid var(--border-subtle)' }}
                                    >
                                        {copiedCode === offer.code ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
                    <Tag size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>No active offers</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Check back later for new deals and promotions!</p>
                </div>
            )}
        </main>
    );
};

export default Offers;
