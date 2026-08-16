const SupportTicket = require('../models/SupportTicket');

// @desc    Create new support ticket
// @route   POST /api/support
// @access  Private
const createTicket = async (req, res) => {
    try {
        const { subject, description, category, priority } = req.body;
        
        const ticketData = {
            subject,
            description,
            category,
            priority: priority || 'normal',
            createdBy: req.user._id
        };

        if (req.user.role === 'customer') {
            ticketData.customer = req.user._id;
        } else if (req.user.role === 'chef') {
            ticketData.chef = req.user._id;
        }

        const ticket = await SupportTicket.create(ticketData);
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Get user's support tickets
// @route   GET /api/support
// @access  Private
const getMyTickets = async (req, res) => {
    try {
        const query = req.user.role === 'customer' 
            ? { customer: req.user._id }
            : req.user.role === 'chef' 
                ? { chef: req.user._id }
                : { createdBy: req.user._id }; // Fallback

        const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Get ticket by ID
// @route   GET /api/support/:id
// @access  Private
const getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('messages.sender', 'name profilePic role');
            
        if (ticket) {
            // Security check: Make sure user owns ticket unless admin
            const isOwner = (ticket.customer && ticket.customer.toString() === req.user._id.toString()) ||
                            (ticket.chef && ticket.chef.toString() === req.user._id.toString()) ||
                            (ticket.createdBy.toString() === req.user._id.toString());
                            
            if (isOwner || ['admin', 'subadmin', 'superadmin'].includes(req.user.role)) {
                res.json(ticket);
            } else {
                res.status(403);
                throw new Error('Not authorized to view this ticket');
            }
        } else {
            res.status(404);
            throw new Error('Ticket not found');
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Add message to ticket
// @route   POST /api/support/:id/reply
// @access  Private
const addTicketMessage = async (req, res) => {
    try {
        const { message, attachments } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            res.status(404);
            throw new Error('Ticket not found');
        }

        const newMessage = {
            sender: req.user._id,
            message,
            attachments: attachments || []
        };

        ticket.messages.push(newMessage);
        
        // Update status based on who replied
        if (['admin', 'subadmin', 'superadmin'].includes(req.user.role)) {
            ticket.status = ticket.chef ? 'waiting_for_chef' : 'waiting_for_customer';
        } else {
            ticket.status = 'in_progress'; // User replied, so back to admin
        }

        await ticket.save();
        
        // Return populated message
        const populatedTicket = await SupportTicket.findById(ticket._id)
            .populate('messages.sender', 'name profilePic role');
            
        // Emit real-time event to the ticket room
        const io = req.app.get('io');
        if (io) {
            io.to('ticket_' + populatedTicket._id.toString()).emit('new_ticket_message', populatedTicket);
        }
            
        res.json(populatedTicket);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Update ticket status
// @route   PUT /api/support/:id/status
// @access  Private
const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            res.status(404);
            throw new Error('Ticket not found');
        }

        ticket.status = status;
        if (status === 'resolved' || status === 'closed') {
            ticket.resolvedAt = Date.now();
        }

        await ticket.save();

        const io = req.app.get('io');
        if (io) {
            io.to('ticket_' + ticket._id.toString()).emit('ticket_status_update', ticket);
        }

        res.json(ticket);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

module.exports = {
    createTicket,
    getMyTickets,
    getTicketById,
    addTicketMessage,
    updateTicketStatus
};
