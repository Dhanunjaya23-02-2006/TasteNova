const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB connected for update...');
    
    // Update all chefs
    const chefs = await User.find({ role: 'chef' });
    for (let chef of chefs) {
        chef.rating = 4.8;
        chef.numReviews = 124;
        chef.isFssaiVerified = true;
        chef.isKitchenVerified = true;
        await chef.save();
    }
    console.log(`Updated ${chefs.length} chefs with mock ratings and verifications.`);

    // Update all menu items
    const items = await MenuItem.find({});
    for (let item of items) {
        item.rating = 4.5;
        item.numReviews = 42;
        await item.save();
    }
    console.log(`Updated ${items.length} menu items with mock ratings.`);

    console.log('Done!');
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
