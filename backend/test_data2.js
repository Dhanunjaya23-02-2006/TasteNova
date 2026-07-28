const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/tastenova-mern');
    const items = await MenuItem.find();
    console.log(items);
    process.exit(0);
}
test();
