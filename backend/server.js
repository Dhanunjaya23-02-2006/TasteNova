const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const debug = require('debug')('tastenova:socket');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const validateEnv = require('./middleware/validateEnv');
const startEscrowSettlementJob = require('./cron/escrowSettlementJob');

dotenv.config();
validateEnv(); // Ensure all secrets are present
connectDB();
startEscrowSettlementJob();

const app = express();

app.use(cors());
app.use(compression());

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Increased to 5000 for development to prevent 429 errors
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' })); // Body parser, limiting data size
app.use(cookieParser()); // Cookie parser for JWT

// Server and Socket.io for chat/tracking
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // For dev, restrict in prod
        methods: ['GET', 'POST']
    }
});
app.set('io', io);

// Socket.io Authentication Middleware
io.use((socket, next) => {
    try {
        // Try to get token from handshake auth or cookies
        let token = socket.handshake.auth?.token;
        
        if (!token && socket.handshake.headers.cookie) {
            // Very basic cookie parsing for socket
            const cookies = socket.handshake.headers.cookie.split(';').reduce((res, c) => {
                const [key, val] = c.trim().split('=').map(decodeURIComponent);
                try {
                    return Object.assign(res, { [key]: JSON.parse(val) });
                } catch (e) {
                    return Object.assign(res, { [key]: val });
                }
            }, {});
            token = cookies.jwt;
        }

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Attach user info to socket
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
});

io.on('connection', (socket) => {
    debug('New authenticated client connected', socket.id, 'User:', socket.user.id);

    socket.on('join_chat', (orderId) => {
        socket.join(orderId);
    });

    socket.on('join_user', () => {
        socket.join('user_' + socket.user.id);
        debug(`Socket joined user room user_${socket.user.id}`);
    });

    socket.on('join_tracking', (orderId) => {
        socket.join('track_' + orderId);
        debug(`Socket joined tracking room for ${orderId}`);
    });

    socket.on('join_chef', (chefId) => {
        // Security check: Only the chef themselves can join their own chef room
        if (socket.user.id === chefId) {
            socket.join('chef_' + chefId);
            debug(`Chef socket joined room chef_${chefId}`);
        } else {
            debug(`Unauthorized attempt to join chef room ${chefId} by ${socket.user.id}`);
        }
    });

    socket.on('join_delivery', () => {
        socket.join('delivery_partners');
        debug(`Delivery socket joined room delivery_partners`);
    });

    socket.on('join_ticket', (ticketId) => {
        socket.join('ticket_' + ticketId);
        debug(`Socket joined ticket room ticket_${ticketId}`);
    });

    socket.on('send_location', (data) => {
        // In a real app, verify that socket.user is the delivery partner assigned to data.orderId
        io.to('track_' + data.orderId).emit('receive_location', data);
    });

    socket.on('send_message', (data) => {
        io.to(data.orderId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        debug('Client disconnected', socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('TasteNova API is running...');
});

// Import Routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// const dashboardRoutes = require('./routes/dashboardRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const menuRoutes = require('./routes/menuRoutes');
const chefBookingRoutes = require('./routes/chefBookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const cityRoutes = require('./routes/cityRoutes');
const offerRoutes = require('./routes/offerRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const platformRoutes = require('./routes/platformRoutes');
const communityRoutes = require('./routes/communityRoutes');
const subadminRoutes2 = require('./routes/subadminRoutes2');
const supportRoutes = require('./routes/supportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const walletRoutes = require('./routes/walletRoutes');
const referralRoutes = require('./routes/referralRoutes');
const contentRoutes = require('./routes/contentRoutes');

// Use Routes
const app_use = false; // Dummy variable to keep the line lengths exact or close
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payment', paymentRoutes);
// app.use('/api/dashboard', dashboardRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/chefBookings', chefBookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subadmin', subadminRoutes2);
app.use('/api/support', supportRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/earnings', walletRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/content', contentRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
