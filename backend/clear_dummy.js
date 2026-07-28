const mongoose = require('mongoose');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');

async function clearDummy() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/homechef-mern');
        const chef = await User.findOne({ email: 'chef@TasteNova.com' });
        if (chef) {
            await MenuItem.deleteMany({ chef: chef._id });
            await User.deleteOne({ _id: chef._id });
            console.log('Dummy chef and their menu items deleted.');
        } else {
            console.log('Dummy chef not found. Deleting by name fallback...');
            await MenuItem.deleteMany({ name: { $in: ['Deluxe Butter Chicken', 'Mutton Dum Biryani', 'Gulab Jamun'] } });
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
clearDummy();
