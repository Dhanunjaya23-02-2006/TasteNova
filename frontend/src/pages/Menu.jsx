import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { Star, MapPin, Search } from 'lucide-react';

const Menu = () => {
    const navigate = useNavigate();
    const [allChefs, setAllChefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchChefs = async () => {
            try {
                // If there is a city in session storage, use it
                const savedCity = sessionStorage.getItem('selectedCity');
                let chefQuery = '';
                if (savedCity) {
                    const parsedCity = JSON.parse(savedCity);
                    if (parsedCity.lat && parsedCity.lng) {
                        chefQuery = `?lat=${parsedCity.lat}&lng=${parsedCity.lng}`;
                    }
                }
                
                const res = await fetch(`${API_URL}/users/chefs${chefQuery}`);
                if (res.ok) {
                    const data = await res.json();
                    setAllChefs(data);
                }
            } catch (error) {
                console.error("Failed to fetch chefs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChefs();
    }, []);

    const filteredChefs = allChefs.filter(chef => 
        (chef.kitchenName || chef.name).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="container hide-scrollbar" style={{ padding: '20px', paddingBottom: '100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 className="menu-title">Explore Nearby Kitchens</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Discover authentic homemade food crafted by local chefs in your area.</p>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', margin: '20px auto', maxWidth: '600px' }}>
                <input 
                    type="text" 
                    placeholder="Search for Home Chefs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '45px', height: '55px', borderRadius: '16px', fontSize: '1.05rem', background: 'rgba(255,255,255,0.05)' }}
                />
                <Search size={22} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }}>
                    <div className="spinner"></div>
                </div>
            ) : filteredChefs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No kitchens found matching your search.</p>
                </div>
            ) : (
                <div className="menu-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {filteredChefs.map((chef) => (
                        <div 
                            key={chef._id} 
                            className="food-card" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/chef/${chef._id}`)}
                        >
                            <div className="food-card-img-container">
                                <img 
                                    src={chef.kitchenImage && chef.kitchenImage.trim() !== '' ? chef.kitchenImage : 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'} 
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'; }}
                                    alt={chef.kitchenName || chef.name} 
                                    className="food-card-img" 
                                />
                            </div>
                            
                            <div className="food-card-content">
                                <h3 className="food-title">{chef.kitchenName || chef.name}</h3>
                                <p className="food-desc" style={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>{chef.bio || 'Authentic home cooked meals made with love.'}</p>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                    <Star size={16} color="var(--primary)" fill="var(--primary)" />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{chef.rating?.toFixed(1) || '4.0'} ({chef.numReviews || 0})</span>
                                    {chef.isKitchenVerified && (
                                        <span style={{ fontSize: '0.8rem', background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>Verified</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default Menu;
