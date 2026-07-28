import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Star, ArrowLeft, Clock, MapPin, CheckCircle, MessageCircle, UserPlus, CalendarHeart } from 'lucide-react';
import toast from 'react-hot-toast';

const ChefMenu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user, updateUser } = useContext(AuthContext);
    
    const [chef, setChef] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('menu');
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    useEffect(() => {
        const fetchChefAndMenu = async () => {
            try {
                setLoading(true);
                const [chefRes, menuRes] = await Promise.all([
                    fetch(`${API_URL}/users/chef/${id}`),
                    fetch(`${API_URL}/menu?chef=${id}`)
                ]);

                if (!chefRes.ok) {
                    throw new Error('Chef not found');
                }

                const chefData = await chefRes.json();
                const menuData = await menuRes.json();

                setChef(chefData);
                setMenuItems(menuData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChefAndMenu();
    }, [id]);

    useEffect(() => {
        if (user && user.following) {
            setIsFollowing(user.following.includes(id));
        } else {
            setIsFollowing(false);
        }
    }, [user, id]);

    const handleFollowToggle = async () => {
        if (!user) {
            toast.error('Please login to follow chefs');
            return;
        }

        try {
            setIsFollowLoading(true);
            const res = await fetch(`${API_URL}/users/follow/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update follow status');
            }

            const data = await res.json();
            setIsFollowing(data.following.includes(id));
            updateUser({ ...user, following: data.following });
            toast.success(data.message);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsFollowLoading(false);
        }
    };

    const handleAddToCart = (item) => {
        addToCart(item);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !chef) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--error)' }}>{error || 'Chef not found'}</h2>
                <button className="btn btn-outline" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                    <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Home
                </button>
            </div>
        );
    }

    return (
        <main className="container hide-scrollbar" style={{ padding: '20px', paddingBottom: '100px' }}>
            <button 
                onClick={() => navigate('/')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}
            >
                <ArrowLeft size={20} /> Back to explore
            </button>

            {/* Chef Profile Header */}
            <div style={{ background: 'var(--bg-glass)', borderRadius: '24px', border: '1px solid var(--border-subtle)', marginBottom: '40px' }}>
                    <div style={{ position: 'relative', height: '250px' }}>
                        <img 
                            loading="lazy"
                            src={chef.kitchenImage && chef.kitchenImage.trim() !== '' ? chef.kitchenImage : 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80'} 
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80'; }}
                            alt="Kitchen Header" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', position: 'absolute', inset: 0, zIndex: 0, borderRadius: '24px 24px 0 0' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 100%)', zIndex: 1 }}></div>
                        <div className="chef-header-info" style={{ zIndex: 2 }}>
                            <img 
                                loading="lazy"
                                src={chef.profileImage || `https://ui-avatars.com/api/?name=${chef.name}&background=random`} 
                                alt={chef.name} 
                                className="chef-header-avatar"
                            />
                            <div className="chef-title-text">
                                <h1 style={{ margin: '0 0 5px 0', fontSize: '2rem' }}>{chef.kitchenName || chef.name}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '15px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Star size={16} color="var(--primary)" fill="var(--primary)" /> {chef.rating?.toFixed(1) || '4.0'} ({chef.numReviews || 0} reviews)</span>
                                    {chef.isKitchenVerified && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2ecc71' }}><CheckCircle size={16} /> Verified Kitchen</span>}
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button 
                                        className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`} 
                                        onClick={handleFollowToggle}
                                        disabled={isFollowLoading}
                                        style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', minWidth: '130px', justifyContent: 'center', opacity: isFollowLoading ? 0.7 : 1 }}
                                    >
                                        <UserPlus size={16} /> {isFollowLoading ? 'Wait...' : (isFollowing ? 'Following' : 'Follow Chef')}
                                    </button>
                                    <button 
                                        className="btn btn-outline" 
                                        onClick={() => toast('Chat feature coming soon!', { icon: '💬' })}
                                        style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <MessageCircle size={16} /> Message
                                    </button>
                                    <button 
                                        className="btn btn-outline" 
                                        onClick={() => toast('Catering requests coming soon!', { icon: '🎉' })}
                                        style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <CalendarHeart size={16} /> Book Catering
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="chef-header-bio">
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>About this Kitchen</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{chef.bio || "Experience the authentic taste of home with our carefully crafted meals, made using traditional recipes and the freshest ingredients."}</p>
                        
                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16} color="var(--primary)" /> Pre-order Required (4 hrs)</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} color="var(--primary)" /> {chef.address || 'Local Kitchen'}</span>
                        </div>
                    </div>
                </div>

            {/* Profile Tabs */}
            <div className="profile-tabs-container" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border)', marginBottom: '30px', marginTop: '20px', overflowX: 'auto', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                <button 
                    onClick={() => setActiveTab('menu')}
                    style={{ background: 'none', border: 'none', padding: '10px 0', fontSize: '1.1rem', fontWeight: activeTab === 'menu' ? 'bold' : 'normal', color: activeTab === 'menu' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'menu' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    Order Menu
                </button>
                <button 
                    onClick={() => setActiveTab('updates')}
                    style={{ background: 'none', border: 'none', padding: '10px 0', fontSize: '1.1rem', fontWeight: activeTab === 'updates' ? 'bold' : 'normal', color: activeTab === 'updates' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'updates' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    Updates & Specials
                </button>
            </div>

            {activeTab === 'menu' ? (
                <>
                    {/* Menu Items Grid */}
                    {menuItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>This chef hasn't added any dishes yet.</p>
                </div>
            ) : (
                <div className="menu-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {menuItems.map((item) => (
                        <div key={item._id} className="food-card">
                            <div className="food-card-img-container">
                                <img loading="lazy" src={item.image} alt={item.name} className="food-card-img" />
                                {item.offerPrice && (
                                    <div className="discount-badge" style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--error)', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {Math.round(((item.price - item.offerPrice) / item.price) * 100)}% OFF
                                    </div>
                                )}
                            </div>
                            
                            <div className="food-card-content">
                                <h3 className="food-title">{item.name}</h3>
                                <p className="food-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
                                    <Star size={16} color="var(--primary)" fill="var(--primary)" />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.rating?.toFixed(1) || '4.0'} ({item.numReviews || 0})</span>
                                </div>
                                
                                <div className="food-footer">
                                    <div className="food-price-container">
                                        {item.offerPrice && <span className="food-price-strike">₹{item.price}</span>}
                                        <span className="food-price">₹{item.offerPrice || item.price}</span>
                                    </div>
                                    <button 
                                        className="btn-add"
                                        onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                        </div>
                    )}
                </>
            ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeUp 0.4s ease-out' }}>
                    <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <img loading="lazy" src={chef.profileImage || `https://ui-avatars.com/api/?name=${chef.name}&background=random`} alt={chef.name} style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{chef.kitchenName || chef.name}</h4>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>2 hours ago</span>
                            </div>
                        </div>
                        <p style={{ lineHeight: '1.6', marginBottom: '20px', color: 'var(--text-light)', fontSize: '1.05rem' }}>
                            🎉 <strong>Diwali Special Pre-orders are OPEN!</strong> 🎉<br/><br/>
                            We're preparing our signature homemade Kaju Katli and Besan Laddoos this festive season. Pure ghee, zero preservatives, just like grandma used to make.<br/><br/>
                            Limited boxes available. Message me directly to reserve yours before we sell out!
                        </p>
                        <img loading="lazy" src="https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=800&q=80" style={{ width: '100%', borderRadius: '16px', height: '300px', objectFit: 'cover' }} alt="Diwali Sweets" />
                        <div style={{ marginTop: '15px', display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span style={{ cursor: 'pointer' }}>❤️ 24 Likes</span>
                            <span style={{ cursor: 'pointer' }}>💬 5 Comments</span>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <img loading="lazy" src={chef.profileImage || `https://ui-avatars.com/api/?name=${chef.name}&background=random`} alt={chef.name} style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{chef.kitchenName || chef.name}</h4>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>3 days ago</span>
                            </div>
                        </div>
                        <p style={{ lineHeight: '1.6', marginBottom: '15px', color: 'var(--text-light)', fontSize: '1.05rem' }}>
                            Due to heavy rain today, delivery times might be slightly longer than usual. Thanks to all my amazing customers for your patience! We're making sure your food stays piping hot during transit. 🌧️🍛
                        </p>
                        <div style={{ marginTop: '15px', display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span style={{ cursor: 'pointer' }}>❤️ 12 Likes</span>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ChefMenu;
