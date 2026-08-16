import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { 
    ShoppingBag, User as UserIcon, ChefHat, LogOut, MapPin, 
    Search, Home as HomeIcon, LayoutGrid, Tag, Heart, 
    ChevronDown, ListOrdered, Repeat, CalendarCheck, 
    Map, CreditCard, Star, Wallet, Bell, HelpCircle, Settings
} from 'lucide-react';
import LocationPickerModal from './LocationPickerModal';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [activeLocation, setActiveLocation] = useState(() => {
        const saved = sessionStorage.getItem('selectedCity');
        if (saved) {
            const parsed = JSON.parse(saved);
            return { label: parsed.cityName || parsed.label, address: parsed.address || parsed.cityName, lat: parsed.lat, lng: parsed.lng };
        }
        return { label: 'Select Location', address: '' };
    });
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-otp'].includes(location.pathname) || location.pathname.includes('/register');

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // Close dropdown on route change
    useEffect(() => {
        setIsProfileDropdownOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const isCustomerLoggedIn = user && user.role === 'user';

    // RENDER FOR LOGGED-IN CUSTOMERS (THE NEW LAYOUT)
    if (isCustomerLoggedIn) {
        return (
            <>
                <nav className="navbar animate-fade-up" style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {/* Left Section: Logo & Location */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                            <img src="/logo.png" alt="TasteNova Logo" style={{ height: '45px', width: '45px', objectFit: 'contain', borderRadius: '50%', border: '1px solid var(--border-subtle)' }} />
                            <span className="nav-brand" style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>TasteNova</span>
                        </Link>
                        
                        <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)', margin: '0 10px' }}></div>
                        
                        <button 
                            onClick={() => setIsLocationModalOpen(true)}
                            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left', padding: '5px' }}
                            className="location-selector"
                        >
                            <MapPin size={20} style={{ color: 'var(--primary-color)' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1 }}>Deliver to</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {activeLocation.label}
                                    </span>
                                    <ChevronDown size={14} style={{ color: 'var(--text-main)' }} />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Middle Section: Navigation Links & Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'center' }}>
                        <Link to="/" className="nav-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                            <HomeIcon size={20} />
                            <span>Home</span>
                        </Link>
                        <Link to="/chefs" className="nav-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                            <ChefHat size={20} />
                            <span>Chefs</span>
                        </Link>
                        <Link to="/categories" className="nav-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                            <LayoutGrid size={20} />
                            <span>Categories</span>
                        </Link>
                        <Link to="/offers" className="nav-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                            <Tag size={20} />
                            <span>Offers</span>
                        </Link>

                        <div style={{ position: 'relative', width: '300px', marginLeft: '20px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                placeholder="Search food, chefs..." 
                                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg-surface)', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    {/* Right Section: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <Link to="/cart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)', position: 'relative' }}>
                            <ShoppingBag size={22} />
                            {cartCount > 0 && (
                                <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--primary-color)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                    {cartCount}
                                </span>
                            )}
                            <span style={{ fontSize: '0.8rem' }}>Cart</span>
                        </Link>
                        
                        <Link to="/account/favourites" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)' }}>
                            <Heart size={20} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Favourites</span>
                        </Link>

                        <Link 
                            to="/account"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px', textDecoration: 'none' }}
                        >
                            {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name} style={{ height: '36px', width: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                                <div style={{ height: '36px', width: '36px', minWidth: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name ? user.name.split(' ')[0] : 'User'}</span>
                        </Link>
                    </div>
                </nav>
                
                <LocationPickerModal 
                    isOpen={isLocationModalOpen}
                    onClose={() => setIsLocationModalOpen(false)}
                    onSelect={(loc) => {
                        setActiveLocation(loc);
                        sessionStorage.setItem('selectedCity', JSON.stringify({
                            cityName: loc.label,
                            address: loc.address,
                            lat: loc.lat,
                            lng: loc.lng
                        }));
                        window.dispatchEvent(new Event('locationChanged'));
                        if (location.pathname === '/chefs') {
                            window.location.reload();
                        }
                    }}
                    savedAddresses={user.addresses || []}
                />
            </>
        );
    }

    // ORIGINAL NAVBAR FOR LOGGED OUT USERS OR NON-CUSTOMERS
    return (
        <nav className="navbar animate-fade-up">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <img src="/logo.png" alt="TasteNova Logo" style={{ height: '56px', width: '56px', objectFit: 'contain', borderRadius: '50%', border: '1px solid var(--border-subtle)' }} />
                <span className="nav-brand" style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>TasteNova</span>
            </Link>
            <ul className="nav-links">
                <li><Link to="/" className="nav-link">Home</Link></li>
                <li><Link to="/how-it-works" className="nav-link">How It Works</Link></li>
                <li><Link to="/for-chefs" className="nav-link">For Chefs</Link></li>
                <li><Link to="/cities" className="nav-link">Cities</Link></li>
                <li><Link to="/about" className="nav-link">About Us</Link></li>
                
                {user && !isAuthPage && (
                    <li>
                        <Link to="/cart" className="nav-link" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            <ShoppingBag size={20} />
                            Cart {cartCount > 0 && (
                                <span style={{ 
                                    background: 'var(--accent)', 
                                    color: '#FFF', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '0.75rem', 
                                    marginLeft: '6px',
                                    fontWeight: 600
                                }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </li>
                )}

                {user ? (
                    <>
                        <li>
                            <Link to="/account" className="nav-link">
                                <UserIcon size={18} />
                                {user.name.split(' ')[0]}
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', gap: '6px' }}>
                                <LogOut size={16} /> Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <li>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.95rem' }}>
                            Login
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
