import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, ShieldCheck, MapPin, Phone, Car, CreditCard, ChevronRight, Edit2, X, Loader } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

const DeliveryProfilePage = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        phone: user?.phone || '',
        vehicleType: user?.vehicleType || '',
        vehicleNumber: user?.vehicleNumber || '',
        bankName: user?.bankDetails?.bankName || '',
        accountNumber: user?.bankDetails?.accountNumber || '',
        ifscCode: user?.bankDetails?.ifscCode || ''
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const payload = {
                phone: formData.phone,
                vehicleType: formData.vehicleType,
                vehicleNumber: formData.vehicleNumber,
                bankDetails: {
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode
                }
            };
            const res = await api.put('/users/profile', payload);
            updateUser(res.data);
            toast.success('Profile updated successfully!');
            setShowModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const ProfileItem = ({ icon: Icon, label, value }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '10px', background: '#F8F9FA', borderRadius: '50%', color: 'var(--text-muted)' }}><Icon size={20} /></div>
                <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{value}</div>
                </div>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
        </div>
    );

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: '24px', position: 'relative' }}>
                <button onClick={() => setShowModal(true)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    <Edit2 size={16} /> Edit
                </button>
                <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1e8449 100%)', padding: '40px 20px', textAlign: 'center', color: '#fff' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, margin: '0 auto 16px' }}>
                        {user?.name?.charAt(0) || 'R'}
                    </div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem' }}>{user?.name || 'Rahul Kumar'}</h2>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
                        ⭐ 4.8 Rating
                    </div>
                </div>

                <div>
                    <ProfileItem icon={Phone} label="Phone Number" value={user?.phone || 'Not provided'} />
                    <ProfileItem icon={Car} label="Vehicle Details" value={`${user?.vehicleNumber || 'No Plate'} (${user?.vehicleType || 'Not specified'})`} />
                    <ProfileItem icon={ShieldCheck} label="Documents" value={user?.isIdVerified ? "Verified" : "Pending Verification"} />
                    <ProfileItem icon={CreditCard} label="Bank Account" value={user?.bankDetails?.accountNumber ? `${user?.bankDetails?.bankName || 'Bank'} **** ${user.bankDetails.accountNumber.slice(-4)}` : 'Not provided'} />
                    <ProfileItem icon={MapPin} label="Home Address" value={user?.addresses?.[0]?.formattedAddress || user?.addresses?.[0]?.area || 'Not provided'} />
                </div>
            </div>
            
            <button style={{ width: '100%', padding: '16px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)', fontWeight: 600, textAlign: 'left', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                Change Password <ChevronRight size={20} color="var(--text-muted)" />
            </button>
            <button style={{ width: '100%', padding: '16px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)', fontWeight: 600, textAlign: 'left', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                App Settings <ChevronRight size={20} color="var(--text-muted)" />
            </button>

            {/* Edit Profile Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '40px 20px', overflowY: 'auto' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '24px', margin: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: "'DM Serif Display', serif" }}>Edit Profile</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>Phone Number</label>
                                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>Vehicle Type</label>
                                <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: '#fff' }}>
                                    <option value="">Select Type</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Scooter">Scooter</option>
                                    <option value="Electric Bike">Electric Bike</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>Vehicle Number Plate</label>
                                <input value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} type="text" placeholder="e.g. TS09 AB 1234" style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                            </div>
                            
                            <h4 style={{ margin: '8px 0 0', color: 'var(--text-main)' }}>Bank Details</h4>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>Bank Name</label>
                                <input value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>Account Number</label>
                                <input value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>IFSC Code</label>
                                <input value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                            </div>

                            <button disabled={updating} type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: '16px', opacity: updating ? 0.7 : 1 }}>
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryProfilePage;
