const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    available: { type: Boolean, default: true },
    ingredientCost: { type: Number, required: true }, // for admin profit tracking
    offerPrice: { type: Number }, // Optional promotional price
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prepTime: { type: Number, default: 15 }, // Preparation time in minutes
}, { timestamps: true });

// Add index for trending queries
menuItemSchema.index({ available: 1, rating: -1, numReviews: -1 });

// Add index for chef's menu queries
menuItemSchema.index({ chef: 1, available: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
