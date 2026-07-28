const mongoose = require('mongoose');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const bcrypt = require('bcrypt');

async function seedKitchen() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/tastenova-mern');
        console.log('MongoDB Connected for Seeding Kitchen...');

        // Create a Chef User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const newChef = new User({
            name: 'Master Chef',
            email: 'chef@TasteNova.com',
            password: hashedPassword,
            phone: '9876543210',
            address: '123 Gourmet Street',
            role: 'chef',
            status: 'active',
            businessName: "TasteNova Signature Kitchen",
            description: "A premium culinary experience right from home.",
            kitchenImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
            rating: 4.8,
            numReviews: 24,
            isIdVerified: true,
            isFssaiVerified: true,
            isKitchenVerified: true,
            fssaiNumber: "FSSAI-123456789"
        });

        const savedChef = await newChef.save();
        console.log('Created Chef:', savedChef.businessName);

        // Update all menu items to belong to this chef
        const updateRes = await MenuItem.updateMany({}, { chef: savedChef._id });
        console.log(`Updated ${updateRes.modifiedCount} menu items to belong to the new chef.`);

        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
}

seedKitchen();
