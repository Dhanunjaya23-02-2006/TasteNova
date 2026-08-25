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
            return { label: parsed.cityName || parsed.label || 'Selected Location', address: parsed.address || parsed.cityName || '', lat: parsed.lat, lng: parsed.lng };
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

    // Add class to body to ensure padding for bottom nav when customer is logged in
    useEffect(() => {
        if (isCustomerLoggedIn) {
            document.body.classList.add('has-mobile-bottom-nav');
            return () => document.body.classList.remove('has-mobile-bottom-nav');
        }
    }, [isCustomerLoggedIn]);

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

                    {/* Middle Section: Navigation Links & Search (Desktop Only) */}
                    <div className="hide-on-mobile-flex" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'center' }}>
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
                        <Link to="/cart" className="hide-on-mobile-flex" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)', position: 'relative' }}>
                            <ShoppingBag size={22} />
                            {cartCount > 0 && (
                                <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--primary-color)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                    {cartCount}
                                </span>
                            )}
                            <span style={{ fontSize: '0.8rem' }}>Cart</span>
                        </Link>
                        
                        <Link to="/account/favourites" className="hide-on-mobile-flex" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-main)' }}>
                            <Heart size={20} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Favourites</span>
                        </Link>

                        <Link 
                            to="/account"
                            className="hide-on-mobile-flex"
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
                        
                        {/* Mobile Search/Cart Icons */}
                        <div className="show-on-mobile-flex" style={{ display: 'none', alignItems: 'center', gap: '16px' }}>
                            <Search size={22} style={{ color: 'var(--text-main)' }} />
                            <Link to="/cart" style={{ position: 'relative', color: 'var(--text-main)' }}>
                                <ShoppingBag size={22} />
                                {cartCount > 0 && (
                                    <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Mobile Bottom Navigation */}
                <div className="show-on-mobile-flex" style={{
                    display: 'none',
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '70px',
                    background: '#fff',
                    borderTop: '1px solid var(--border-subtle)',
                    zIndex: 1000,
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
                }}>
                    <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-muted)', textDecoration: 'none' }}>
                        <HomeIcon size={24} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Home</span>
                    </Link>
                    <Link to="/chefs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: location.pathname === '/chefs' ? 'var(--primary)' : 'var(--text-muted)', textDecoration: 'none' }}>
                        <Search size={24} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Search</span>
                    </Link>
                    <Link to="/cart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: location.pathname === '/cart' ? 'var(--primary)' : 'var(--text-muted)', textDecoration: 'none', position: 'relative' }}>
                        <ShoppingBag size={24} />
                        {cartCount > 0 && (
                            <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--primary)', color: '#fff', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px', fontWeight: 'bold' }}>
                                {cartCount}
                            </span>
                        )}
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Cart</span>
                    </Link>
                    <Link to="/account" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: location.pathname.includes('/account') ? 'var(--primary)' : 'var(--text-muted)', textDecoration: 'none' }}>
                        <UserIcon size={24} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Profile</span>
                    </Link>
                </div>
                
                <LocationPickerModal 
                    isOpen={isLocationModalOpen}
                    onClose={() => setIsLocationModalOpen(false)}
                    onSelect={(loc) => {
                        const locationData = {
                            label: loc.suburb || loc.label || loc.city || 'Selected Location',
                            address: loc.address,
                            lat: loc.lat,
                            lng: loc.lng
                        };
                        setActiveLocation(locationData);
                        sessionStorage.setItem('selectedCity', JSON.stringify({
                            cityName: locationData.label,
                            label: locationData.label,
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar animate-fade-up">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <img src="/logo.png" alt="TasteNova Logo" style={{ height: '45px', width: '45px', objectFit: 'contain', borderRadius: '50%', border: '1px solid var(--border-subtle)' }} />
                <span className="nav-brand" style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>TasteNova</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
                className="show-on-mobile" 
                style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-main)', padding: '8px' }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ width: '24px', height: '2px', background: 'currentColor', transition: '0.3s', transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }}></span>
                    <span style={{ width: '24px', height: '2px', background: 'currentColor', transition: '0.3s', opacity: mobileMenuOpen ? 0 : 1 }}></span>
                    <span style={{ width: '24px', height: '2px', background: 'currentColor', transition: '0.3s', transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }}></span>
                </div>
            </button>

            <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : 'hide-on-mobile-flex'}`} style={{
                display: mobileMenuOpen ? 'flex' : 'flex',
                ...(mobileMenuOpen && window.innerWidth <= 768 ? {
                    position: 'absolute',
                    top: '80px',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    flexDirection: 'column',
                    padding: '20px',
                    boxShadow: 'var(--shadow-floating)',
                    borderBottom: '1px solid var(--border-subtle)',
                    gap: '20px',
                    alignItems: 'flex-start'
                } : {})
            }}>
                <li><Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
                <li><Link to="/how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>How It Works</Link></li>
                <li><Link to="/for-chefs" className="nav-link" onClick={() => setMobileMenuOpen(false)}>For Chefs</Link></li>
                <li><Link to="/cities" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Cities</Link></li>
                <li><Link to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</Link></li>
                
                {user && !isAuthPage && (
                    <li>
                        <Link to="/cart" className="nav-link" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 700, color: 'var(--primary)' }}>
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
                            <Link to="/account" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
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
                    <li style={mobileMenuOpen ? { width: '100%' } : {}}>
                        <Link to="/login" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 24px', fontSize: '0.95rem', display: mobileMenuOpen ? 'block' : 'inline-block', textAlign: 'center' }}>
                            Login
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
