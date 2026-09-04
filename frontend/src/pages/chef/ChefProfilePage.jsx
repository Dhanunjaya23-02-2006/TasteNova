import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { User, Star, MapPin, ShieldCheck, ChefHat, Award, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const ChefProfilePage = () => {
    const { user, login } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [uploadingPic, setUploadingPic] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        businessName: user?.businessName || '',
        description: user?.description || '',
        phone: user?.phone || '',
        profilePic: user?.profilePic || '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setForm({
                        name: data.name || '',
                        businessName: data.businessName || '',
                        description: data.description || '',
                        phone: data.phone || '',
                        profilePic: data.profilePic || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user?.token]);

    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${API_URL}/reviews/${user._id}`);
                if (res.ok) setReviews(await res.json());
            } catch (e) { console.error(e); }
        };
        if (user) fetchReviews();
    }, [user]);

    const handlePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingPic(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${user.token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setForm({ ...form, profilePic: data.url });
                toast.success('Photo uploaded! Click Save to apply.');
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            toast.error('An error occurred during upload');
        } finally {
            setUploadingPic(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const updated = await res.json();
                login(updated);
                toast.success('Profile updated!');
                setEditing(false);
            }
        } catch (e) { toast.error('Error updating profile'); }
    };

    const cardStyle = {
        background: 'var(--bg-card)', borderRadius: '16px', padding: '24px',
        border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)'
    };

    const badges = [
        { label: 'Identity Verified', verified: user?.isIdVerified },
        { label: 'FSSAI Verified', verified: user?.isFssaiVerified },
        { label: 'Kitchen Verified', verified: user?.isKitchenVerified },
    ];

    return (
        <div className="animate-fade-up">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>Kitchen Profile</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Profile Card */}
                <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 800, flexShrink: 0, overflow: 'hidden' }}>
                            {form.profilePic || user?.profilePic ? (
                                <img src={form.profilePic || user.profilePic} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : user?.name?.charAt(0)?.toUpperCase()}
                            
                            {editing && (
                                <label style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.75rem', textAlign: 'center', padding: '4px 0', cursor: 'pointer' }}>
                                    {uploadingPic ? '...' : 'Upload'}
                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handlePicUpload} disabled={uploadingPic} />
                                </label>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            {editing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                                    <input className="form-control" placeholder="Kitchen Name" value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} />
                                    <textarea className="form-control" placeholder="Tell customers about your kitchen..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
                                    <input className="form-control" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={handleSave} className="btn btn-primary" style={{ padding: '8px 20px' }}>Save</button>
                                        <button onClick={() => setEditing(false)} className="btn btn-secondary" style={{ padding: '8px 20px' }}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{user?.businessName || user?.name}</h2>
                                        <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                            <Edit3 size={16} />
                                        </button>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>
                                        <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                        {user?.addresses?.[0]?.streetAddress || 'Location not set'}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f39c12', fontWeight: 600 }}>
                                            <Star size={16} fill="#f39c12" /> {user?.rating?.toFixed(1) || 'New'} ({user?.numReviews || 0} reviews)
                                        </span>
                                    </div>
                                    {user?.description && (
                                        <p style={{ marginTop: '12px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6 }}>{user.description}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 16px 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} color="var(--primary)" /> Trust Badges
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {badges.map((badge, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', background: badge.verified ? 'rgba(39,174,96,0.08)' : 'rgba(0,0,0,0.02)' }}>
                                <ShieldCheck size={18} color={badge.verified ? '#27ae60' : 'var(--text-muted)'} />
                                <span style={{ fontWeight: 500, color: badge.verified ? '#27ae60' : 'var(--text-muted)' }}>
                                    {badge.verified ? '✓' : '○'} {badge.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Reviews */}
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 16px 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={20} color="#f39c12" /> Recent Reviews
                    </h3>
                    {reviews.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No reviews yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {reviews.slice(0, 5).map(review => (
                                <div key={review._id} style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.user?.name || 'Customer'}</span>
                                        <span style={{ color: '#f39c12', fontWeight: 600, fontSize: '0.85rem' }}>{'⭐'.repeat(review.rating)}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChefProfilePage;
