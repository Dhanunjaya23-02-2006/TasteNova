import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { User, Phone, Mail, Lock, ShieldCheck, CheckCircle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsTab = () => {
    const { user, login } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profilePic: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                profilePic: user.profilePic || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                toast.success("Profile updated successfully!");
                // Update local storage and context
                const updatedUser = { ...user, ...data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                login(updatedUser); // Update context instantly
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setIsUploading(true);
        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
                body: uploadData
            });

            if (res.ok) {
                const data = await res.json();
                const imageUrl = `${API_URL.replace('/api', '')}${data.url}`;
                setFormData({ ...formData, profilePic: imageUrl });
                
                // Immediately save to profile to sync backend and context
                const updateRes = await fetch(`${API_URL}/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ profilePic: imageUrl })
                });

                if (updateRes.ok) {
                    const updateData = await updateRes.json();
                    const updatedUser = { ...user, ...updateData };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    login(updatedUser);
                    toast.success('Profile picture updated!');
                }
            } else {
                toast.error('Image upload failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred during upload');
        } finally {
            setIsUploading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords don't match!");
        }
        const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).+$/;
        if (!regex.test(passwordData.newPassword)) {
            return toast.error('Password must contain at least one number, one symbol, and one uppercase letter');
        }
        
        setIsChangingPassword(true);
        try {
            const res = await fetch(`${API_URL}/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Password changed successfully!');
                setIsPasswordFormVisible(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.message || 'Failed to change password');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            
            <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Account Settings</h2>
                <p style={{ color: 'var(--text-muted)' }}>Update your personal details and secure your account.</p>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={18} style={{ color: 'var(--primary)' }} /> Personal Information
                    </h3>
                </div>
                
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ position: 'relative' }}>
                        {formData.profilePic || user?.profilePic ? (
                            <img src={formData.profilePic || user.profilePic} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-subtle)' }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            <Camera size={14} />
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isUploading} />
                        </label>
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>Profile Photo</h4>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{isUploading ? 'Uploading...' : 'Upload a high-quality image (JPG or PNG).'}</p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <User size={18} />
                                </span>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Mail size={18} />
                                </span>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled
                                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-muted)', fontSize: '1rem', outline: 'none', cursor: 'not-allowed' }}
                                />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email address cannot be changed directly. Contact support if needed.</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Phone Number</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Phone size={18} />
                                </span>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="btn btn-primary" 
                            style={{ padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {isSaving ? 'Saving...' : <><CheckCircle size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={18} style={{ color: 'var(--primary)' }} /> Security
                    </h3>
                </div>
                
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!isPasswordFormVisible ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '4px' }}>Password</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Update your password to keep your account secure.</p>
                            </div>
                            <button onClick={() => setIsPasswordFormVisible(true)} className="btn btn-outline" type="button" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                                Change Password
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-body)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '8px' }}>Change Password</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Current Password</label>
                                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>New Password</label>
                                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Must contain 1 uppercase, 1 number, and 1 symbol (!@#$%^&*)</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Confirm New Password</label>
                                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)' }} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                                <button type="button" onClick={() => setIsPasswordFormVisible(false)} className="btn" style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isChangingPassword} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> Your data is securely encrypted.
            </div>

        </div>
    );
};

export default SettingsTab;
