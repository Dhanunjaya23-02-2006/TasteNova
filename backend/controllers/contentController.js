const PageContent = require('../models/PageContent');

// @desc    Get page content by slug
// @route   GET /api/content/:slug
// @access  Public
const getPageContent = async (req, res) => {
    try {
        const content = await PageContent.findOne({ pageSlug: req.params.slug });
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update page content
// @route   PUT /api/content/:slug
// @access  Private/SuperAdmin
const updatePageContent = async (req, res) => {
    try {
        let content = await PageContent.findOne({ pageSlug: req.params.slug });
        if (!content) {
            content = new PageContent({
                pageSlug: req.params.slug,
                title: req.body.title || req.params.slug,
                content: req.body.content
            });
        } else {
            content.title = req.body.title || content.title;
            content.content = req.body.content || content.content;
        }
        const updated = await content.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPageContent, updatePageContent };
