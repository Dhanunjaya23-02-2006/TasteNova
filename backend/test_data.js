const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/tastenova-mern');
    const items = await MenuItem.find().populate('chef');
    console.log("Items count:", items.length);
    if(items.length > 0) {
        console.log("First item:", items[0]);
    }
    process.exit(0);
}
test();
