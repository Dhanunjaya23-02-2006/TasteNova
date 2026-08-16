import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, Loader } from 'lucide-react';

const ContentManagement = () => {
    const { user } = useContext(AuthContext);
    const [selectedPage, setSelectedPage] = useState('about-us');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const pages = [
        { slug: 'about-us', label: 'About Us' },
        { slug: 'how-it-works', label: 'How It Works' },
        { slug: 'for-chefs', label: 'For Chefs' }
    ];

    useEffect(() => {
        fetchContent(selectedPage);
    }, [selectedPage]);

    const fetchContent = async (slug) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/content/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setTitle(data.title || '');
                setContent(data.content || '');
            } else {
                // If not found, reset form
                setTitle('');
                setContent('');
            }
        } catch (error) {
            toast.error('Failed to fetch page content');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/content/${selectedPage}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ title, content })
            });

            if (res.ok) {
                toast.success('Page content updated successfully');
            } else {
                toast.error('Failed to update content');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-up">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>Content Management</h1>

            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                    {pages.map(page => (
                        <button
                            key={page.slug}
                            onClick={() => setSelectedPage(page.slug)}
                            className={`btn ${selectedPage === page.slug ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: selectedPage !== page.slug ? '1px solid var(--border-subtle)' : 'none' }}
                        >
                            {page.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Loader className="spin" size={24} style={{ display: 'block', margin: '0 auto 10px' }} />
                        Loading content...
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Page Title</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                placeholder="e.g. About TasteNova"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>HTML Content</label>
                            <textarea 
                                className="form-control" 
                                rows={15} 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter valid HTML or plain text here..."
                                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Note: The content you enter here will be injected directly into the page layout. You can use standard HTML tags like &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, etc.</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                                {saving ? <Loader className="spin" size={18} /> : <Save size={18} />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentManagement;
