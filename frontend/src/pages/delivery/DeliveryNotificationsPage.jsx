import React from 'react';
import { Bell, AlertTriangle, CheckCircle, IndianRupee, MapPin } from 'lucide-react';

const DeliveryNotificationsPage = () => {
    const notifications = [
        { id: 1, type: 'alert', title: 'High Demand Area', message: 'Kukatpally is currently experiencing high order volume. Head there for back-to-back deliveries!', time: '10 mins ago', icon: AlertTriangle, color: '#f39c12' },
        { id: 2, type: 'earning', title: 'Payment Received', message: '₹5,420 has been credited to your bank account ending in 4567.', time: '2 hours ago', icon: IndianRupee, color: 'var(--success)' },
        { id: 3, type: 'system', title: 'Document Verified', message: 'Your renewed vehicle insurance has been verified successfully.', time: '1 day ago', icon: CheckCircle, color: 'var(--primary)' },
        { id: 4, type: 'info', title: 'Zone Update', message: 'Your primary delivery zone has been updated to Kukatpally-Miyapur.', time: '2 days ago', icon: MapPin, color: '#3498db' }
    ];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 24px', color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>Alerts & Updates</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notifications.map(notif => (
                    <div key={notif.id} style={{ display: 'flex', gap: '16px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', alignItems: 'flex-start' }}>
                        <div style={{ background: `${notif.color}15`, color: notif.color, padding: '12px', borderRadius: '50%' }}>
                            <notif.icon size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{notif.title}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{notif.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeliveryNotificationsPage;
