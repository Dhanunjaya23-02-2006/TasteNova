import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, ShieldCheck, MapPin, Phone, Car, CreditCard, ChevronRight } from 'lucide-react';

const DeliveryProfilePage = () => {
    const { user } = useContext(AuthContext);

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
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: '24px' }}>
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
                    <ProfileItem icon={Phone} label="Phone Number" value="+91 98765 43210" />
                    <ProfileItem icon={Car} label="Vehicle Details" value="TS09 AB 1234 (Hero Splendor)" />
                    <ProfileItem icon={ShieldCheck} label="Documents" value="Verified" />
                    <ProfileItem icon={CreditCard} label="Bank Account" value="HDFC **** 4567" />
                    <ProfileItem icon={MapPin} label="Home Address" value="KPHB Colony, Hyderabad" />
                </div>
            </div>
            
            <button style={{ width: '100%', padding: '16px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)', fontWeight: 600, textAlign: 'left', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                Change Password <ChevronRight size={20} color="var(--text-muted)" />
            </button>
            <button style={{ width: '100%', padding: '16px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)', fontWeight: 600, textAlign: 'left', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                App Settings <ChevronRight size={20} color="var(--text-muted)" />
            </button>
        </div>
    );
};

export default DeliveryProfilePage;
