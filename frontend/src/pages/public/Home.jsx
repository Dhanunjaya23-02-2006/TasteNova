
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Star, Clock, ChevronRight, Navigation, X, CheckCircle2, Heart, Bike, ChefHat, ShoppingBag, ShieldCheck, Leaf, Tag } from 'lucide-react';
import { API_URL } from '../../config';

const Home = () => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [location, setLocation] = useState({ type: 'global', cityId: null, cityName: 'Global Content', lat: null, lng: null });
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [featuredChefs, setFeaturedChefs] = useState([]);
    const [loadingChefs, setLoadingChefs] = useState(true);
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initLocation = async () => {
            const savedCity = sessionStorage.getItem('selectedCity');
            if (savedCity) {
                setLocation(JSON.parse(savedCity));
            } else if (!user) {
                // Let guest user browse initially or prompt
                // setShowLocationModal(true);
            }
        };
        initLocation();
        fetchCities();
        fetchCategories();
        fetchFeaturedChefs();
    }, [user]);

    const fetchFeaturedChefs = async () => {
        try {
            const res = await fetch(`${API_URL}/users/chefs/featured`);
            if (res.ok) setFeaturedChefs(await res.json());
        } catch (error) { console.error('Error fetching featured chefs'); }
        finally { setLoadingChefs(false); }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/platform/categories`);
            if (res.ok) setCategories(await res.json());
        } catch (error) { console.error('Error fetching categories'); }
        finally { setLoadingCategories(false); }
    };

    const fetchCities = async () => {
        try {
            const res = await fetch(`${API_URL}/cities`);
            if (res.ok) setCities(await res.json());
        } catch (error) { console.error('Error fetching cities'); }
    };

    const handleSelectCity = (city) => {
        const newLoc = { 
            type: 'manual', 
            cityId: city._id, 
            cityName: city.name,
            lat: city.latitude || 17.4483, 
            lng: city.longitude || 78.3915
        };
        setLocation(newLoc);
        sessionStorage.setItem('selectedCity', JSON.stringify(newLoc));
        setShowLocationModal(false);
        toast.success(`Location set to ${city.name}`);
    };

    const handleUseGps = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newLoc = {
                        type: 'gps',
                        cityId: null,
                        cityName: 'Current Location',
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                    setLocation(newLoc);
                    sessionStorage.setItem('selectedCity', JSON.stringify(newLoc));
                    setShowLocationModal(false);
                    toast.success('Location detected successfully');
                },
                (err) => {
                    toast.error("Please allow location access to see nearby chefs.");
                    setShowLocationModal(false);
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser.");
        }
    };

    const handleFindFoodClick = () => {
        if (user) {
            navigate('/menu');
        } else {
            toast.error('Please login to find food near you');
            navigate('/login');
        }
    };

    return (
        <main>
            {/* HERO SECTION */}
            <section className="landing-hero">
                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px', paddingBottom: '0' }}>
                    
                    {/* Left Content */}
                    <div style={{ flex: '1 1 500px' }}>
                        <div className="hero-badge">
                            🔥 Home-cooked with love, delivered to you
                        </div>
                        <h1 className="hero-heading">
                            Home-cooked <span style={{ color: 'var(--primary)' }}>food</span>,<br/>
                            from kitchens<br/>
                            you can trust.
                        </h1>
                        <p className="hero-subtext">
                            Discover authentic meals from passionate home chefs near you. Fresh, hygienic & made with love.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <button onClick={handleFindFoodClick} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '8px' }}>
                                <MapPin size={18} style={{ marginRight: '8px' }} /> Find Food Near Me
                            </button>
                            <button onClick={() => navigate('/for-chefs')} className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '8px', border: '2px solid var(--primary)' }}>
                                Explore Chefs
                            </button>
                        </div>

                        <div className="hero-features">
                            <div className="hero-feature-item"><ShieldCheck size={20} color="var(--primary)"/> Hygienic & Safe</div>
                            <div className="hero-feature-item"><Heart size={20} color="var(--accent)"/> Made with Love</div>
                            <div className="hero-feature-item"><Bike size={20} color="var(--primary)"/> Quick Delivery</div>
                            <div className="hero-feature-item"><ChefHat size={20} color="var(--primary)"/> Local Chefs</div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div style={{ flex: '1 1 450px', position: 'relative' }}>
                        <div className="hero-image-wrapper">
                            <img 
                                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80" 
                                alt="Chef cooking" 
                                className="hero-main-img"
                            />
                            
                            {/* Floating Cards */}
                            {featuredChefs.length > 0 && (
                                <div className="floating-card" style={{ top: '30px', left: '-30px', cursor: 'pointer' }} onClick={() => navigate(`/chef/${featuredChefs[0]._id}`)}>
                                    <img src={featuredChefs[0].profilePic || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&q=80'} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt={featuredChefs[0].businessName || featuredChefs[0].name} />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{featuredChefs[0].businessName || featuredChefs[0].name}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={12} color="var(--warning)" fill="var(--warning)"/> {featuredChefs[0].rating?.toFixed(1) || '4.8'} ({featuredChefs[0].numReviews || 0})
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>Top Rated Chef</p>
                                    </div>
                                </div>
                            )}

                            {featuredChefs.length > 1 ? (
                                <div className="floating-card" style={{ bottom: '40px', right: '-20px', cursor: 'pointer' }} onClick={() => navigate(`/chef/${featuredChefs[1]._id}`)}>
                                    <img src={featuredChefs[1].profilePic || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&q=80'} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt={featuredChefs[1].businessName || featuredChefs[1].name} />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{featuredChefs[1].businessName || featuredChefs[1].name}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={12} color="var(--warning)" fill="var(--warning)"/> {featuredChefs[1].rating?.toFixed(1) || '4.8'} ({featuredChefs[1].numReviews || 0})
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>Highly Recommended</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="floating-card" style={{ bottom: '40px', right: '-20px' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '8px' }}>
                                        <ShoppingBag size={20} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Delivering happiness</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>to your doorstep</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="container" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
                <h2 className="section-title">How <span style={{ color: 'var(--primary)' }}>TasteNova</span> Works</h2>
                
                <div className="steps-container">
                    <div className="step-line"></div>
                    
                    <div className="step-item">
                        <div className="step-icon-wrapper" style={{ background: '#E8F5E9' }}>
                            <MapPin size={32} color="#2E7D32" />
                        </div>
                        <div className="step-number">1</div>
                        <h4 style={{ margin: '15px 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Set Your Location</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '200px' }}>Tell us where you are so we can show nearby home chefs.</p>
                    </div>

                    <div className="step-item">
                        <div className="step-icon-wrapper" style={{ background: '#FFF3E0' }}>
                            <ChefHat size={32} color="#EF6C00" />
                        </div>
                        <div className="step-number" style={{ background: '#EF6C00' }}>2</div>
                        <h4 style={{ margin: '15px 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Choose a Chef</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '200px' }}>Browse menus, ratings & reviews. Pick your favorite home chef.</p>
                    </div>

                    <div className="step-item">
                        <div className="step-icon-wrapper" style={{ background: '#F3E5F5' }}>
                            <ShoppingBag size={32} color="#6A1B9A" />
                        </div>
                        <div className="step-number" style={{ background: '#6A1B9A' }}>3</div>
                        <h4 style={{ margin: '15px 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Place Your Order</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '200px' }}>Order securely & our chef starts preparing fresh just for you.</p>
                    </div>

                    <div className="step-item">
                        <div className="step-icon-wrapper" style={{ background: '#FCE4EC' }}>
                            <Bike size={32} color="#C2185B" />
                        </div>
                        <div className="step-number" style={{ background: '#C2185B' }}>4</div>
                        <h4 style={{ margin: '15px 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Get It Delivered</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '200px' }}>Enjoy hot, delicious home-cooked food at your doorstep.</p>
                    </div>
                </div>
            </section>

            {/* POPULAR CUISINES SECTION */}
            <section className="container" style={{ paddingBottom: '40px' }}>
                <h2 className="section-title">Popular Cuisines</h2>
                {loadingCategories ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading cuisines...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {categories.filter(c => c.isActive !== false).slice(0, 5).map(category => (
                            <div key={category._id} className="cuisine-card" onClick={() => navigate(`/menu?category=${category._id}`)} style={{ cursor: 'pointer' }}>
                                <img src={category.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80'} className="cuisine-img" alt={category.name} />
                                <div style={{ padding: '16px', textAlign: 'center' }}>
                                    <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700 }}>{category.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{category.description || 'Delicious home-style meals.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* WHY CHOOSE TASTENOVA SECTION */}
            <section className="container">
                <h2 className="section-title">Why Choose <span style={{ color: 'var(--primary)' }}>TasteNova</span>?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    
                    <div className="feature-box">
                        <ShieldCheck size={32} className="feature-box-icon" />
                        <div>
                            <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>Verified Home Chefs</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>All chefs are verified for hygiene & quality.</p>
                        </div>
                    </div>

                    <div className="feature-box">
                        <Leaf size={32} className="feature-box-icon" />
                        <div>
                            <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>Fresh & Hygienic</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Meals are prepared fresh in clean kitchens.</p>
                        </div>
                    </div>

                    <div className="feature-box">
                        <Tag size={32} className="feature-box-icon" />
                        <div>
                            <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>No Hidden Charges</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Transparent pricing. What you see is what you pay.</p>
                        </div>
                    </div>

                    <div className="feature-box">
                        <Heart size={32} className="feature-box-icon" />
                        <div>
                            <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>Support Local</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Support local home chefs and small kitchens.</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA BANNER */}
            <section className="container">
                <div className="cta-banner">
                    {/* Decorative abstract elements */}
                    <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-50px', right: '100px', width: '150px', height: '150px', border: '2px solid rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

                    <div style={{ flex: '1', position: 'relative', zIndex: 1, paddingRight: '40px' }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '15px' }}>Craving something delicious?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '30px' }}>Find the best home-cooked food near you.</p>
                        
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <button onClick={handleFindFoodClick} style={{ background: 'white', color: 'var(--primary)', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <MapPin size={18} /> Find Food Near Me
                            </button>
                            <button onClick={() => navigate('/for-chefs')} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.5)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                                Explore Chefs
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 1, alignItems: 'flex-end' }}>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Available on</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ background: 'black', color: 'white', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2v20l18-10L2 2z" fill="#fff"/></svg>
                                <div>
                                    <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>GET IT ON</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1 }}>Google Play</div>
                                </div>
                            </div>
                            <div style={{ background: 'black', color: 'white', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 14.5c0 3.5-3 5.5-4.5 5.5s-4.5-2-4.5-5.5c0-3.5 2-6.5 4.5-6.5s4.5 3 4.5 6.5zM12 2C9.5 2 7 4 7 6.5s2.5 4.5 5 4.5 5-2 5-4.5S14.5 2 12 2z"/></svg>
                                <div>
                                    <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>Download on the</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1 }}>App Store</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Modal */}
            <AnimatePresence>
                {showLocationModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ background: 'var(--bg-surface)', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '400px', border: '1px solid var(--border-subtle)', position: 'relative' }}
                        >
                            <button onClick={() => setShowLocationModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                            
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Where are you?</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.95rem' }}>Set your location to see nearby chefs and localized offers.</p>

                            <button 
                                onClick={handleUseGps}
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.05rem' }}
                            >
                                <Navigation size={20} />
                                Allow Location Access
                            </button>

                            {cities.length > 0 ? (
                                <>
                                    <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: '0.9rem', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                                        <span style={{ background: 'var(--bg-surface)', padding: '0 10px', position: 'relative' }}>OR SELECT MANUALLY</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {cities.map(city => (
                                            <button 
                                                key={city._id} 
                                                onClick={() => handleSelectCity(city)}
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-main)', fontSize: '1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                                            >
                                                <MapPin size={18} color="var(--primary)" />
                                                {city.name}, {city.state}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No cities configured yet. Click Allow Location to browse globally.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default Home;
