const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

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
        image: 'https://tse1.explicit.bing.net/th/id/OIP.Un4TftP-Etzm4WoOF10nxgHaGp?w=585&h=525&rs=1&pid=ImgDetMain&o=7&rm=3',
        ingredientCost: 50,
        available: true
    }
];

async function seed() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/tastenova-mern');
        console.log('MongoDB Connected for Seeding...');
        await MenuItem.deleteMany(); // Clear existing
        await MenuItem.insertMany(seedData);
        console.log('Database seeded with beautiful image links!');
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
}
seed();
