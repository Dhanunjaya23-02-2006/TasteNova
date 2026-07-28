const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const testDb = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const superadmin = await User.findOne({ role: 'superadmin' });
        const admin = await User.findOne({ role: 'admin' });
        
        console.log('Superadmin exists:', !!superadmin);
        console.log('Admin exists:', !!admin);

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

testDb();
