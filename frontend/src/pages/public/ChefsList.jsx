import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
import { ChefHat, Search, Star, MapPin, Navigation, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ChefsList = () => {
    const [chefs, setChefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // Check if user has a location set in session storage
        const savedLoc = sessionStorage.getItem('selectedCity');
        if (savedLoc) {
            setUserLocation(JSON.parse(savedLoc));
        }
    }, []);

    useEffect(() => {
        const fetchChefs = async () => {
            setLoading(true);
            try {
                let url = `${API_URL}/users/chefs`;
                if (userLocation && userLocation.lat && userLocation.lng) {
                    url += `?lat=${userLocation.lat}&lng=${userLocation.lng}`;
                }
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    // If no location was provided, API might return paginated response { data: [...] }
                    const chefData = data.data || data; 
                    setChefs(chefData);
                } else {
                    toast.error("Failed to load chefs");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error connecting to server");
            } finally {
                setLoading(false);
            }
        };

        fetchChefs();
    }, [userLocation]);

    const filteredChefs = chefs.filter(chef => {
        const nameMatch = chef.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          chef.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch;
    });

    return (
        <main className="container mt-4 mb-5 animate-fade-up" style={{ minHeight: '60vh' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '30px', flexDirection: window.innerWidth <= 768 ? 'column' : 'row' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(23, 107, 69, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                        <ChefHat size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Home Chefs</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Discover passionate cooks in your area.</p>
                    </div>
                </div>

                <div style={{ position: 'relative', width: '100%', flex: window.innerWidth <= 768 ? 'none' : '1 1 300px', maxWidth: window.innerWidth <= 768 ? '100%' : '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Search chefs by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '12px 16px 12px 42px', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border-subtle)', 
                            background: 'var(--bg-card)', 
                            outline: 'none', 
                            fontSize: '0.95rem',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton" style={{ height: '320px', borderRadius: '16px' }}></div>
                    ))}
                </div>
            ) : filteredChefs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {filteredChefs.map(chef => (
                        <div key={chef._id} style={{
                            background: 'var(--bg-card)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: 'var(--shadow-card)',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ height: '140px', background: 'var(--bg-dark)', position: 'relative' }}>
                                {chef.kitchenImage ? (
                                    <img 
                                        src={chef.kitchenImage} 
                                        alt="Kitchen" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1556910103-1c02745a872f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
                                        }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                                        <ChefHat size={40} opacity={0.3} />
                                    </div>
                                )}
                                
                                {chef.distance !== undefined && (
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                        <Navigation size={12} color="var(--primary)" />
                                        {chef.distance.toFixed(1)} km
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ padding: '20px', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ position: 'absolute', top: '-30px', left: '20px', width: '60px', height: '60px', borderRadius: '50%', border: '3px solid var(--bg-card)', background: 'var(--primary)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', fontWeight: 'bold', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    {chef.profilePic ? (
                                        <img 
                                            src={chef.profilePic} 
                                            alt={chef.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${chef.name}`;
                                            }}
                                        />
                                    ) : (
                                        chef.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                
                                <div style={{ marginTop: '24px' }}>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 700 }}>
                                        {chef.businessName || chef.name}
                                    </h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> {chef.addresses?.[0]?.city || 'Location unavailable'}
                                    </p>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                                        <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={12} fill="var(--warning)" />
                                            {chef.rating ? chef.rating.toFixed(1) : 'New'}
                                        </div>
                                        {chef.numReviews > 0 && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                ({chef.numReviews} reviews)
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {chef.description || "Authentic home-cooked meals prepared with love and hygiene."}
                                    </p>
                                </div>
                                
                                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                    <Link 
                                        to={`/chef/${chef._id}`} 
                                        className="btn btn-outline" 
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px' }}
                                    >
                                        View Kitchen <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
                    <ChefHat size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                        {searchTerm ? 'No chefs match your search' : 'No chefs available in your area'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {searchTerm ? 'Try adjusting your search terms.' : 'We are expanding to more areas soon!'}
                    </p>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="btn btn-primary mt-3" style={{ padding: '8px 16px' }}>
                            Clear Search
                        </button>
                    )}
                </div>
            )}
        </main>
    );
};

export default ChefsList;
