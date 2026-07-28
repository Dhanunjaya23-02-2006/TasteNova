const ChefBooking = require('../models/ChefBooking');

// @desc    Create a new chef booking request
// @route   POST /api/chefBookings
// @access  Private (User)
const createBooking = async (req, res) => {
    try {
        const { contactDetails, partyType, date, time, location, guestCount, eventDetails, advanceAmount, paymentId } = req.body;

        const newBooking = new ChefBooking({
            user: req.user._id,
            contactDetails,
            partyType,
            date,
            time,
            location,
            guestCount: Number(guestCount),
            eventDetails,
            advanceAmount,
            paymentId,
            chef: req.body.chef // Assigned chef ID from frontend
        });

        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        console.error('Error creating chef booking:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user chef bookings
// @route   GET /api/chefBookings/mybookings
// @access  Private
const getUserBookings = async (req, res) => {
    try {
        const bookings = await ChefBooking.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user chef bookings:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all chef bookings (for Admin)
// @route   GET /api/chefBookings
// @access  Private/Admin
const getAdminBookings = async (req, res) => {
    try {
        const query = {};
        if (req.user.role === 'chef') {
            query.chef = req.user._id;
        }
        const bookings = await ChefBooking.find(query).populate('user', 'name email').populate('chef', 'name businessName').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching admin chef bookings:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Accept a chef booking request
// @route   PUT /api/chefBookings/:id/accept
// @access  Private/Admin
const acceptBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const booking = await ChefBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ownership check
        if (req.user.role === 'chef' && booking.chef.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to accept this booking' });
        }

        booking.status = 'Confirmed';

        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } catch (error) {
        console.error('Error accepting chef booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject a chef booking request
// @route   PUT /api/chefBookings/:id/reject
// @access  Private/Admin
const rejectBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const booking = await ChefBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ownership check
        if (req.user.role === 'chef' && booking.chef.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to reject this booking' });
        }

        booking.status = 'Rejected';

        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } catch (error) {
        console.error('Error rejecting chef booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getAdminBookings,
    acceptBooking,
    rejectBooking
};
