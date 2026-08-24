import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';
import OrdersTab from '../../components/chef/OrdersTab';
import io from 'socket.io-client';

const ChefOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [orderFilter, setOrderFilter] = useState('Instant');

    useEffect(() => { 
        fetchOrders(); 
        
        if (user) {
            const socket = io(API_URL.replace('/api', ''));
            socket.emit('join_chef', user._id);
            socket.on('new_order_alert', () => {
                toast.success('NEW ORDER RECEIVED!', { icon: '🔔' });
                fetchOrders();
            });
            socket.on('order_status_update', () => {
                fetchOrders();
            });
            return () => socket.disconnect();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setOrders(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleUpdateOrder = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) { toast.success('Order status updated'); fetchOrders(); }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="animate-fade-up">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>Orders</h1>
            <OrdersTab orders={orders} orderFilter={orderFilter} setOrderFilter={setOrderFilter} fetchOrders={fetchOrders} handleUpdateOrder={handleUpdateOrder} />
        </div>
    );
};

export default ChefOrdersPage;
