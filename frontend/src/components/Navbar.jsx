import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, User as UserIcon, ChefHat, LogOut, LayoutDashboard, Truck } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <nav className="navbar animate-fade-up">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <img src="/logo.png" alt="TasteNova Logo" style={{ height: '56px', width: '56px', objectFit: 'contain', borderRadius: '50%', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)' }} />
                <span className="gradient-text" style={{ fontSize: '1.6rem' }}>TasteNova</span>
            </Link>
            <ul className="nav-links">
                <li><Link to="/menu" className="nav-link">Menu</Link></li>
                
                {user ? (
                    <>
                        {user.role === 'superadmin' && (
                            <li><Link to="/superadmin" className="nav-link"><LayoutDashboard size={18} /> Main Hub</Link></li>
                        )}
                        {(user.role === 'subadmin' || user.role === 'admin') && (
                            <li><Link to="/subadmin" className="nav-link"><LayoutDashboard size={18} /> Sub-Admin</Link></li>
                        )}
                        {user.role === 'chef' && (
                            <li><Link to="/chef-dashboard" className="nav-link"><ChefHat size={18} /> Chef Hub</Link></li>
                        )}
                        {user.role === 'delivery' && (
                            <li><Link to="/delivery-dashboard" className="nav-link"><Truck size={18} /> Delivery</Link></li>
                        )}
                        <li>
                            <Link to="/account" className="nav-link">
                                <UserIcon size={18} />
                                {user.name.split(' ')[0]}
                            </Link>
                        </li>
                        {(!user || user.role === 'user') && (
                            <li>
                                <Link to="/checkout" className="nav-link" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                    <ShoppingBag size={20} />
                                    Cart {cartCount > 0 && (
                                        <span style={{ 
                                            background: 'var(--primary)', 
                                            color: '#000', 
                                            padding: '2px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.75rem', 
                                            marginLeft: '6px',
                                            boxShadow: '0 0 10px var(--primary-glow)'
                                        }}>
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        )}
                        <li>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', gap: '6px' }}>
                                <LogOut size={16} /> Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/checkout" className="nav-link">
                                <ShoppingBag size={20} />
                                Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>
                        </li>
                        <li>
                            <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.95rem' }}>
                                Login
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
