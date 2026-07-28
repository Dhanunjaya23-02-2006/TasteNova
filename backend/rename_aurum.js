const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB connected for renaming...');
    
    const chef = await User.findOne({ businessName: /Aurum/i });
    if (chef) {
        chef.businessName = chef.businessName.replace(/Aurum/i, 'TasteNova');
        await chef.save();
        console.log(`Renamed kitchen to: ${chef.businessName}`);
    } else {
        console.log('No kitchen with name Aurum found.');
    }

    console.log('Done!');
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
