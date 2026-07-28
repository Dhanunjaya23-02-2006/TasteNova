const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const ChefBooking = require('./models/ChefBooking');
    const User = require('./models/User');

    let output = '';

    // 1. List all users
    const users = await User.find({}).select('_id name email role').lean();
    output += '=== ALL USERS ===\n';
    users.forEach(u => {
        output += `  ${u.role}: ${u.name} (${u.email}) - ID: ${String(u._id)}\n`;
    });

    // 2. Find the regular user (non-admin, non-delivery)
    const regularUser = users.find(u => u.role === 'user');
    const adminUser = users.find(u => u.role === 'admin');

    output += '\n=== TESTING WITH USER: ' + (regularUser ? regularUser.name : 'NO REGULAR USER FOUND') + ' ===\n';

    // 3. Generate a token for the regular user
    const testUser = regularUser || adminUser;
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    output += 'Generated token for: ' + testUser.name + ' (ID: ' + String(testUser._id) + ')\n';

    // 4. Check existing bookings for this user
    const userBookings = await ChefBooking.find({ user: testUser._id }).lean();
    output += '\nExisting bookings for this user: ' + userBookings.length + '\n';

    // 5. Create a TEST booking for this user directly
    const testBooking = new ChefBooking({
        user: testUser._id,
        contactDetails: '9876543210',
        partyType: 'Birthday',
        date: new Date('2026-03-15'),
        time: '18:00',
        location: 'Test Location, Mumbai',
        guestCount: 25,
        eventDetails: 'Test birthday party booking',
        advanceAmount: 500,
        paymentId: 'test_payment_001'
    });

    const saved = await testBooking.save();
    output += '\n=== CREATED TEST BOOKING ===\n';
    output += 'Booking ID: ' + String(saved._id) + '\n';
    output += 'User ID: ' + String(saved.user) + '\n';
    output += 'Party Type: ' + saved.partyType + '\n';
    output += 'Status: ' + saved.status + '\n';

    // 6. Verify we can fetch it back
    const fetchedBookings = await ChefBooking.find({ user: testUser._id }).sort({ createdAt: -1 }).lean();
    output += '\n=== FETCHED BOOKINGS FOR USER ===\n';
    output += 'Count: ' + fetchedBookings.length + '\n';
    fetchedBookings.forEach(b => {
        output += `  - ${b.partyType} on ${b.date} | Status: ${b.status} | ID: ${String(b._id)}\n`;
    });

    // 7. Also list ALL bookings
    const allBookings = await ChefBooking.find({}).lean();
    output += '\n=== ALL BOOKINGS IN DB ===\n';
    output += 'Count: ' + allBookings.length + '\n';
    allBookings.forEach(b => {
        const userMatch = users.find(u => String(u._id) === String(b.user));
        output += `  - ${b.partyType} | User: ${userMatch ? userMatch.name : 'ORPHANED (' + String(b.user) + ')'} | Status: ${b.status}\n`;
    });

    require('fs').writeFileSync('debug_output.txt', output);
    console.log('Done. Check debug_output.txt');

    await mongoose.disconnect();
}).catch(e => console.error(e));
