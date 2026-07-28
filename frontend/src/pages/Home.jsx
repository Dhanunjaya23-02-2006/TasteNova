import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Star, Clock, ChevronRight, Navigation, X } from 'lucide-react';
import { API_URL } from '../config';

const Home = () => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [location, setLocation] = useState({ type: 'global', cityId: null, cityName: 'Global Content', lat: null, lng: null });
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [cities, setCities] = useState([]);
    
    const [banners, setBanners] = useState([]);
    const [featuredChefs, setFeaturedChefs] = useState([]);
    const [trendingDishes, setTrendingDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [categories, setCategories] = useState([]);

    // Determine Initial Location
    useEffect(() => {
        const initLocation = async () => {
            // 1. Saved Address
            if (user && user.addresses && user.addresses.length > 0 && user.addresses[0].city) {
                // We need the city object or ID. Assuming addresses[0].city is an object or string
                // For simplicity, let's just prompt if we don't have a strict city ID, or fetch user profile.
                // Let's check session storage first
                const savedCity = sessionStorage.getItem('selectedCity');
                if (savedCity) {
                    setLocation(JSON.parse(savedCity));
                } else {
                    // Try to infer from user
                    setShowLocationModal(true);
                }
            } else {
                const savedCity = sessionStorage.getItem('selectedCity');
                if (savedCity) {
                    setLocation(JSON.parse(savedCity));
                } else {
                    setShowLocationModal(true);
                }
            }
        };
        initLocation();
        fetchCities();
    }, [user]);

    // Fetch Data whenever location changes
    useEffect(() => {
        fetchData();
    }, [location.lat, location.lng, location.cityId]);

    const fetchCities = async () => {
        try {
            const res = await fetch(`${API_URL}/cities`);
            if (res.ok) setCities(await res.json());
        } catch (error) { console.error('Error fetching cities'); }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const cityQuery = location.cityId ? `?cityId=${location.cityId}` : '';
            const chefQuery = location.lat && location.lng ? `?lat=${location.lat}&lng=${location.lng}` : '';
            
            const [bannerRes, chefRes, trendingRes, categoryRes] = await Promise.all([
                fetch(`${API_URL}/banners/active${cityQuery}`),
                fetch(`${API_URL}/users/chefs/featured${chefQuery}`),
                fetch(`${API_URL}/menu/trending`),
                fetch(`${API_URL}/platform/categories`)
            ]);

            if (bannerRes.ok) setBanners(await bannerRes.json());
            if (chefRes.ok) setFeaturedChefs(await chefRes.json());
            if (trendingRes.ok) setTrendingDishes(await trendingRes.json());
            if (categoryRes.ok) setCategories(await categoryRes.json());

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCity = (city) => {
        const newLoc = { 
            type: 'manual', 
            cityId: city._id, 
            cityName: city.name,
            lat: city.latitude || 17.4483, // Madhapur fallback
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

    const handleAddToCart = (item) => {
        if (!user) {
            toast.error('Please login to add items to the cart');
            navigate('/login');
            return;
        }
        addToCart(item);
        toast.success(`${item.name} added to cart!`);
    };

    return (
        <main className="container" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* Header: Greeting & Location */}
            <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', margin: '0 0 5px 0' }}>
                        👋 Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user ? user.name.split(' ')[0] : 'Guest'}
                    </h2>
                    <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                        onClick={() => setShowLocationModal(true)}
                    >
                        <MapPin size={18} color="var(--primary)" />
                        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                            {location.type === 'global' ? 'Select your delivery location' : `Deliver to: ${location.cityName}`}
                        </span>
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </div>
                </div>
                {user && (
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid var(--border-subtle)' }}>
                        {user.name.charAt(0)}
                    </div>
                )}
            </div>

            {/* Hero Section */}
            <div className="hero-section">
                <h1 className="hero-title">TasteNova</h1>
                <p className="hero-desc">
                    Experience the authentic taste of home. We connect you with passionate local chefs crafting delicious, hygienic, and homemade meals delivered right to your door.
                </p>
                <button 
                    onClick={() => navigate('/menu')}
                    className="btn btn-primary" 
                    style={{ fontSize: '1.1rem', padding: '12px 30px', borderRadius: '30px' }}
                >
                    Explore Nearby Kitchens <ChevronRight size={20} style={{ display: 'inline', verticalAlign: 'middle' }}/>
                </button>
            </div>

            {/* Banners Carousel */}
            {banners.length > 0 && (
                <div style={{ margin: '20px 0', display: 'flex', overflowX: 'auto', gap: '15px', scrollSnapType: 'x mandatory', paddingBottom: '10px' }} className="hide-scrollbar">
                    {banners.map(banner => (
                        <div 
                            key={banner._id} 
                            style={{ 
                                minWidth: '100%', 
                                height: '180px', 
                                borderRadius: '16px', 
                                overflow: 'hidden', 
                                scrollSnapAlign: 'start',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                            onClick={() => banner.linkUrl && window.open(banner.linkUrl, '_blank')}
                        >
                            <img src={banner.imageUrl} alt={banner.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                <h3 style={{ color: '#fff', margin: 0 }}>{banner.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}



            {/* Categories */}
            {categories.length > 0 && (
                <div style={{ margin: '30px 0' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Popular Categories</h3>
                    <div style={{ display: 'flex', overflowX: 'auto', gap: '15px', paddingBottom: '10px' }} className="hide-scrollbar">
                        {categories.map((cat) => (
                            <div key={cat._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px', cursor: 'pointer' }}>
                                <div style={{ width: '65px', height: '65px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                                    {cat.icon}
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Featured Chefs */}
            {featuredChefs.length > 0 && (
                <div style={{ margin: '30px 0' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>⭐ Featured Home Chefs</h3>
                    <div style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '15px' }} className="hide-scrollbar">
                        {featuredChefs.map(chef => (
                            <div 
                                key={chef._id} 
                                style={{ minWidth: '240px', background: 'var(--bg-glass)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                                onClick={() => navigate(`/chef/${chef._id}`)}
                            >
                                <img 
                                    src={chef.kitchenImage && chef.kitchenImage.trim() !== '' ? chef.kitchenImage : 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'} 
                                    loading="lazy"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'; }}
                                    style={{ width: '100%', height: '140px', objectFit: 'cover' }} 
                                    alt={chef.kitchenName || chef.name}
                                />
                                <div style={{ padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{chef.kitchenName || chef.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <Star size={14} color="var(--primary)" fill="var(--primary)" />
                                        <span>{chef.rating?.toFixed(1) || '4.5'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trending Dishes */}
            {trendingDishes.length > 0 && (
                <div style={{ margin: '30px 0' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>🔥 Trending Dishes</h3>
                    <div style={{ display: 'flex', overflowX: 'auto', gap: '15px', paddingBottom: '15px' }} className="hide-scrollbar">
                        {trendingDishes.map(dish => (
                            <div key={dish._id} style={{ minWidth: '160px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <img src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'} loading="lazy" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', marginBottom: '10px' }} />
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dish.name}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{dish.offerPrice ? dish.offerPrice : dish.price}</span>
                                        {dish.offerPrice && (
                                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹{dish.price}</span>
                                        )}
                                    </div>
                                    <button onClick={() => handleAddToCart(dish)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '8px' }}>Add</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Call to Action to Menu */}
            <div style={{ textAlign: 'center', margin: '60px 0', padding: '40px', background: 'var(--bg-glass)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>Hungry for more?</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '1.1rem' }}>Discover all the amazing home kitchens operating in your area.</p>
                <button 
                    onClick={() => navigate('/menu')}
                    className="btn btn-primary" 
                    style={{ padding: '14px 40px', fontSize: '1.1rem', borderRadius: '30px' }}
                >
                    Explore All Kitchens
                </button>
            </div>

            {/* Location Selection Modal */}
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
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', fontSize: '1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
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
            
            {/* Custom scrollbar hiding style */}
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </main>
    );
};

export default Home;
