const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
    pageSlug: { type: String, required: true, unique: true }, // e.g. 'about-us', 'how-it-works', 'for-chefs'
    title: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true } // Can store JSON representing blocks or markdown string
}, { timestamps: true });

module.exports = mongoose.model('PageContent', pageContentSchema);
