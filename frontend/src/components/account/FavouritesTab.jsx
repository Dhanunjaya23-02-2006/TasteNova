import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, ChefHat, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const FavouritesTab = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavourites = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/users/favourites`, { 
                    headers: { Authorization: `Bearer ${user.token}` } 
                });
                if (res.ok) {
                    const data = await res.json();
                    setFavourites(data);
                } else {
                    toast.error('Failed to load favorites');
                }
            } catch (error) {
                console.error("Error fetching favourites", error);
                toast.error('Error loading favorites');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchFavourites();
    }, [user]);


    const handleRemoveFavourite = async (id, name) => {
        // Optimistic UI update
        setFavourites(prev => prev.filter(f => f._id !== id));
        if (user && user.following) {
            updateUser({ ...user, following: user.following.filter(fid => fid !== id) });
        }
        toast.success(`Removed ${name} from favourites`);
        
        try {
            await fetch(`${API_URL}/users/follow/${id}`, { 
                method: 'PUT', 
                headers: { Authorization: `Bearer ${user.token}` } 
            });
        } catch (error) {
            console.error('Error removing favorite', error);
        }
    };

    if (loading) {
        return <div className="animate-fade-up" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your favorite kitchens...</div>;
    }

    if (favourites.length === 0) {
        return (
            <div className="animate-fade-up" style={{ background: 'var(--bg-surface)', padding: '60px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
                <Heart size={64} style={{ color: 'var(--border)', margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '10px' }}>No favorites yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Save your favorite home kitchens to access their menus quickly.</p>
                <Link to="/chefs" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '8px' }}>Discover Kitchens</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Favorite Kitchens</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Your handpicked selection of top-rated home chefs.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {favourites.map((kitchen) => (
                    <div key={kitchen._id} style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ position: 'relative', height: '160px' }}>
                            <img src={kitchen.kitchenImage || kitchen.profilePic || 'https://images.unsplash.com/photo-1556910103-1c02745a872e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} alt={kitchen.businessName || kitchen.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))' }}></div>
                            
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFavourite(kitchen._id, kitchen.businessName); }}
                                style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4757', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                            >
                                <Heart size={18} fill="#ff4757" />
                            </button>
                            
                            {!kitchen.isOpen && (
                                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                                    Closed Now
                                </div>
                            )}
                        </div>
                        
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{kitchen.businessName || kitchen.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    <Star size={14} fill="#f1c40f" color="#f1c40f" /> {kitchen.rating || 0}
                                </div>
                            </div>
                            
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{kitchen.description ? (kitchen.description.length > 40 ? kitchen.description.substring(0, 40) + '...' : kitchen.description) : 'Home Kitchen'}</p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                                <MapPin size={14} /> {kitchen.deliveryRadius || 5} km max delivery
                            </div>
                        </div>
                        
                        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center' }}>
                            <Link to={`/chef/${kitchen._id}`} style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                View Menu <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FavouritesTab;
