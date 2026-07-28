const mongoose = require('mongoose');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const bcrypt = require('bcrypt');

const seedData = [
    {
        name: 'Deluxe Butter Chicken',
        description: 'Rich, creamy and full of flavor. Served with love.',
        price: 350,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
        ingredientCost: 150,
        available: true
    },
    {
        name: 'Mutton Dum Biryani',
        description: 'Slow cooked to perfection with aromatic spices.',
        price: 450,
        offerPrice: 390,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        ingredientCost: 200,
        available: true
    },
    {
        name: 'Gulab Jamun',
        description: 'Melt-in-your-mouth sweet dumplings.',
        price: 120,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
        ingredientCost: 50,
        available: true
    }
];

async function seedAll() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/homechef-mern');
        console.log('MongoDB Connected for Complete Seeding...');

        // 1. Find or create Chef
        let chef = await User.findOne({ email: 'chef@TasteNova.com' });
        
        if (!chef) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            
            chef = new User({
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
            await chef.save();
            console.log('Created Chef:', chef.businessName);
        } else {
            console.log('Found existing Chef:', chef.businessName);
        }

        // 2. Add menu items with this chef's ID
        await MenuItem.deleteMany(); // Clear existing menu
        const menuWithChef = seedData.map(item => ({ ...item, chef: chef._id }));
        
        await MenuItem.insertMany(menuWithChef);
        console.log('Database seeded with Menu Items assigned to the Chef!');
        
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
}

seedAll();
