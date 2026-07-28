import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, MapPin, CheckCircle, XCircle } from 'lucide-react';

const BookingsTab = ({ bookings, handleUpdateBooking }) => {
    return (
        <motion.div 
            key="bookings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <h3 className="mb-4">Special Event Inquiries</h3>
            {bookings.length === 0 ? (
                <div className="text-center glass-panel" style={{ padding: '60px', boxShadow: 'var(--shadow-floating)' }}>
                    <Calendar size={48} className="mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    <p>No event bookings at the moment.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {bookings.map(booking => (
                        <div key={booking._id} className="glass-panel" style={{ padding: '20px', boxShadow: 'var(--shadow-floating)' }}>
                            <div className="flex justify-between mb-3">
                                <div className="status-badge status-info">{booking.partyType}</div>
                                <div className={`status-badge ${booking.status === 'Pending' ? 'status-pending' : 'status-success'}`}>{booking.status}</div>
                            </div>
                            
                            <div className="mb-4">
                                <h4 style={{ margin: '0 0 10px 0' }}>{new Date(booking.date).toLocaleDateString()} at {booking.time}</h4>
                                <div className="flex align-center gap-2 mb-2 text-muted">
                                    <Users size={16} /> {booking.guestCount} Guests
                                </div>
                                <div className="flex align-center gap-2 mb-2 text-muted">
                                    <MapPin size={16} /> {booking.location}
                                </div>
                            </div>

                            {booking.status === 'Pending' && (
                                <div className="flex gap-2 mt-4">
                                    <button className="btn btn-primary" onClick={() => handleUpdateBooking(booking._id, 'Confirmed')} style={{ flex: 1 }}>
                                        <CheckCircle size={18} style={{ marginRight: '5px' }} /> Accept
                                    </button>
                                    <button className="btn btn-outline" onClick={() => handleUpdateBooking(booking._id, 'Rejected')} style={{ flex: 1, color: 'var(--error)', borderColor: 'var(--error)' }}>
                                        <XCircle size={18} style={{ marginRight: '5px' }} /> Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default BookingsTab;
