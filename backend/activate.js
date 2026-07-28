const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/homechef-mern').then(async () => {
    const User = require('./models/User');
    await User.updateMany({ role: 'chef' }, { $set: { status: 'active', isKitchenVerified: true } });
    console.log('Updated chefs to active.');
    process.exit();
});
