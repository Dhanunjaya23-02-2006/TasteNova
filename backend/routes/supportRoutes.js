const express = require('express');
const router = express.Router();
const {
    createTicket,
    getMyTickets,
    getTicketById,
    addTicketMessage,
    updateTicketStatus
} = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createTicket)
    .get(protect, getMyTickets);

router.route('/:id')
    .get(protect, getTicketById);

router.route('/:id/reply')
    .post(protect, addTicketMessage);

router.route('/:id/status')
    .put(protect, updateTicketStatus);

module.exports = router;
