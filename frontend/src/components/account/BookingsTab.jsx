import React, { useState, useEffect, useContext } from 'react';
import { CalendarCheck, Users, PartyPopper, ChefHat, MapPin, Clock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const BookingsTab = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/chefbookings/mybookings`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setBookings(data || []);
            } else {
                setBookings([]);
            }
        } catch (error) {
            console.error("Error fetching bookings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    useEffect(() => {
        if (!socket) return;
        
        const handleBookingUpdated = (data) => {
            setBookings(prev => prev.map(booking => {
                if (booking._id === data.bookingId) {
                    toast.success(`Booking is now ${data.status}`);
                    return { ...booking, status: data.status };
                }
                return booking;
            }));
        };

        socket.on('booking_updated', handleBookingUpdated);
        
        return () => {
            socket.off('booking_updated', handleBookingUpdated);
        };
    }, [socket]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return { bg: 'rgba(255, 165, 2, 0.1)', color: '#ffa502' };
            case 'Accepted': return { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db' };
            case 'Completed': return { bg: 'rgba(46, 213, 115, 0.1)', color: '#2ed573' };
            case 'Rejected':
            case 'Cancelled': return { bg: 'rgba(255, 71, 87, 0.1)', color: '#ff4757' };
            default: return { bg: 'var(--bg-surface)', color: 'var(--text-muted)' };
        }
    };

    if (loading) {
        return <div className="animate-fade-up" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading bookings...</div>;
    }

    if (bookings.length === 0) {
        return (
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(252, 128, 25, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
                        <PartyPopper size={40} />
                    </div>
                    <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '12px' }}>Party Bulk Bookings</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                        Hosting a get-together, office lunch, or family function? Let our expert home chefs handle the food!
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                        <Users size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '8px' }}>Serve 10 to 100+</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Customized quantities tailored to your exact guest count.</p>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                        <CalendarCheck size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '8px' }}>Pre-Book Delivery</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Schedule deliveries days or weeks in advance for peace of mind.</p>
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(252, 128, 25, 0.1), rgba(252, 128, 25, 0.05))', borderRadius: '16px', padding: '32px', border: '1px solid rgba(252, 128, 25, 0.2)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '16px' }}>Ready to plan your event?</h3>
                    <p style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '24px' }}>Our bulk order experts will help you curate the perfect menu.</p>
                    
                    <button className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600 }}>
                        Request a Quote
                    </button>
                    <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>We usually respond within 2 hours.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Your Bookings</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Track your party and bulk event bookings.</p>
                </div>
                <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>New Booking</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookings.map((booking) => {
                    const statusStyle = getStatusStyle(booking.status);
                    return (
                        <div key={booking._id} style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
                            
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <ChefHat size={18} style={{ color: 'var(--primary)' }} />
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                                        {booking.chef?.businessName || booking.chef?.name || 'Chef'}
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                        <Users size={16} style={{ color: 'var(--text-muted)' }} /> {booking.guestCount} Guests
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                        <CalendarCheck size={16} style={{ color: 'var(--text-muted)' }} /> {new Date(booking.eventDate).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                        <MapPin size={16} style={{ color: 'var(--text-muted)' }} /> {booking.deliveryAddress?.substring(0, 40) || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', minWidth: '150px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Estimated Price</div>
                                    <div style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800 }}>₹{booking.estimatedPrice || 'TBD'}</div>
                                </div>
                                <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingsTab;
