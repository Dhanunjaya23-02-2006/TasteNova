import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, MapPin, CheckCircle, XCircle, Clock, DollarSign, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingsTab = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/chefBookings/mybookings`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setBookings(data);
            } else {
                console.error('Bookings fetch failed:', data.message);
                toast.error(data.message || 'Failed to load bookings');
            }
        } catch (error) {
            console.error('Failed to fetch bookings', error);
            toast.error('Failed to load party bookings');
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '32px', boxShadow: 'var(--shadow-floating)', animation: 'fadeInUp 0.4s ease' }}>
            <div className="text-center mb-5">
                <PartyPopper size={48} className="mb-2" style={{ color: 'var(--primary-color)' }} />
                <h3 style={{ fontSize: '1.8rem', margin: 0 }}>My Festive Bookings</h3>
                <p style={{ color: 'var(--text-muted)' }}>Manage your scheduled chef requests for special occasions.</p>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center" style={{ padding: '40px', background: 'var(--bg-body)', borderRadius: '20px' }}>
                    <Calendar size={40} className="mb-3" style={{ opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>You haven't requested any party chefs yet.</p>
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>Book a Chef Now</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    <AnimatePresence>
                        {bookings.map((booking, index) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="glass-panel"
                                style={{ 
                                    background: 'rgba(255,255,255,0.03)', 
                                    padding: '24px',
                                    border: '1px solid var(--border-subtle)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: 'var(--shadow-floating)'
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px 15px', background: 'var(--primary-color)', color: 'var(--text-dark)', borderBottomLeftRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {booking.partyType}
                                </div>

                                <div className="mb-4 mt-2">
                                    <div className="flex align-center gap-2 mb-2" style={{ color: 'var(--text-dark)' }}>
                                        <Calendar size={16} />
                                        <span style={{ fontWeight: 600 }}>{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex align-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <Clock size={14} />
                                        <span>{booking.time}</span>
                                    </div>
                                </div>

                                <div className="flex align-center gap-2 mb-3" style={{ background: 'var(--bg-body)', padding: '10px', borderRadius: '12px' }}>
                                    <Users size={16} style={{ color: 'var(--secondary-color)' }} />
                                    <span><strong>{booking.guestCount}</strong> Guests attending</span>
                                </div>

                                <div className="flex align-center gap-2 mb-3" style={{ fontSize: '0.9rem' }}>
                                    <MapPin size={16} style={{ color: 'var(--primary-color)' }} />
                                    <span style={{ color: 'var(--text-muted)' }}>{booking.location}</span>
                                </div>

                                <hr style={{ borderColor: 'var(--border)', margin: '15px 0' }} />

                                <div className="flex justify-between align-center">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <div className="flex align-center gap-1" style={{ 
                                            fontSize: '0.85rem', 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            background: booking.status === 'Confirmed' ? 'rgba(0, 184, 148, 0.1)' : booking.status === 'Rejected' ? 'rgba(214, 48, 49, 0.1)' : 'rgba(255,165,0,0.1)',
                                            color: booking.status === 'Confirmed' ? '#00b894' : booking.status === 'Rejected' ? '#d63031' : '#ffa500'
                                        }}>
                                            {booking.status === 'Confirmed' ? <CheckCircle size={12} /> : booking.status === 'Rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                                            {booking.status}
                                        </div>
                                        {booking.advanceAmount > 0 && (
                                            <div className="flex align-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 'bold' }}>
                                                <DollarSign size={12} /> ₹{booking.advanceAmount} Advance Paid
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default BookingsTab;
