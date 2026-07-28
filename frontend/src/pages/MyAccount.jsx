import React, { useContext, useState, Suspense, lazy } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileTab = lazy(() => import('../components/account/ProfileTab'));
const OrdersTab = lazy(() => import('../components/account/OrdersTab'));
const BookingsTab = lazy(() => import('../components/account/BookingsTab'));
const UserSubscriptions = lazy(() => import('../components/UserSubscriptions'));

const MyAccount = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="container mt-4" style={{ animation: 'fadeInUp 0.6s ease' }}>
            <h2 className="text-center mb-4" style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: '800' }}>My Basecamp</h2>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('profile')} style={{ padding: '12px 30px', minWidth: '150px' }}>Profile Details</button>
                {user?.role === 'user' && (
                    <>
                        <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('orders')} style={{ padding: '12px 30px', minWidth: '150px' }}>Order History</button>
                        <button className={`btn ${activeTab === 'subscriptions' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('subscriptions')} style={{ padding: '12px 30px', minWidth: '150px' }}>Subscriptions</button>
                        <button className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('bookings')} style={{ padding: '12px 30px', minWidth: '150px' }}>Party Bookings</button>
                    </>
                )}
            </div>

            <Suspense fallback={<p className="text-center mt-4">Loading tab...</p>}>
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'orders' && <OrdersTab />}
                {activeTab === 'subscriptions' && <UserSubscriptions />}
                {activeTab === 'bookings' && <BookingsTab />}
            </Suspense>
        </div>
    );
};

export default MyAccount;
