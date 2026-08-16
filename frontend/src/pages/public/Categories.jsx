import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
import { LayoutGrid, ChevronRight, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/platform/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.filter(c => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder));
                } else {
                    toast.error("Failed to load categories");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error connecting to server");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Helper to render icon, handling both emoji and URL
    const renderIcon = (icon) => {
        if (!icon) return <Utensils size={40} style={{ color: 'var(--primary)' }} />;
        
        // If it looks like a URL
        if (icon.startsWith('http') || icon.startsWith('/')) {
            return <img src={icon} alt="Category Icon" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />;
        }
        
        // Assume it's an emoji or short text
        return <span style={{ fontSize: '3rem', display: 'inline-block', lineHeight: 1 }}>{icon}</span>;
    };

    return (
        <main className="container mt-4 mb-5 animate-fade-up" style={{ minHeight: '60vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                <div style={{ background: 'rgba(23, 107, 69, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                    <LayoutGrid size={28} />
                </div>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Explore Categories</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Find exactly what you're craving today.</p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '16px' }}></div>
                    ))}
                </div>
            ) : categories.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {categories.map(category => (
                        <Link 
                            key={category._id} 
                            to={`/menu?category=${category._id}`}
                            style={{
                                background: 'var(--bg-card)',
                                borderRadius: '16px',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                gap: '15px',
                                border: '1px solid var(--border-subtle)',
                                textDecoration: 'none',
                                color: 'var(--text-main)',
                                transition: 'all 0.3s ease',
                                boxShadow: 'var(--shadow-card)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-floating)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            }}
                        >
                            <div style={{ 
                                width: '90px', 
                                height: '90px', 
                                borderRadius: '50%', 
                                background: 'var(--bg-dark)', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.05)'
                            }}>
                                {renderIcon(category.icon)}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 4px 0' }}>{category.name}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    View Dishes <ChevronRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
                    <Utensils size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>No categories found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>We are currently updating our menus. Check back soon!</p>
                </div>
            )}
        </main>
    );
};

export default Categories;
