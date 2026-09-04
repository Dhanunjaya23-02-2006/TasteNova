import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import BookingsTab from '../../components/chef/BookingsTab';
import { SocketContext } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const ChefPartyOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [bookings, setBookings] = useState([]);

    useEffect(() => { 
        fetchBookings(); 
        
        if (socket) {
            const handleNewBooking = () => {
                toast.success('NEW PARTY BOOKING REQUEST!', { icon: '📅' });
                fetchBookings();
            };
            const handleBookingUpdate = () => {
                fetchBookings();
            };

            socket.on('new_booking', handleNewBooking);
            socket.on('booking_update', handleBookingUpdate);

            return () => {
                socket.off('new_booking', handleNewBooking);
                socket.off('booking_update', handleBookingUpdate);
            };
        }
    }, [socket]);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/chefBookings`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setBookings(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleUpdateBooking = async (id, status) => {
        const action = status === 'Confirmed' ? 'accept' : 'reject';
        try {
            const res = await fetch(`${API_URL}/chefBookings/${id}/${action}`, {
                method: 'PUT', headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) fetchBookings();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="animate-fade-up">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>Party & Bulk Orders</h1>
            <BookingsTab bookings={bookings} handleUpdateBooking={handleUpdateBooking} />
        </div>
    );
};

export default ChefPartyOrdersPage;
