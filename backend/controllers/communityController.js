const CommunityPost = require('../models/CommunityPost');

// @desc    Create a new community post
// @route   POST /api/community
// @access  Private (Chef/Admin)
const createPost = async (req, res) => {
    try {
        const { content, image } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const post = new CommunityPost({
            author: req.user._id,
            content,
            image
        });

        const createdPost = await post.save();
        
        // Populate author before returning
        await createdPost.populate('author', 'name businessName kitchenImage profileImage role');
        
        res.status(201).json(createdPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all community posts
// @route   GET /api/community
// @access  Private (Chef/Admin)
const getPosts = async (req, res) => {
    try {
        const posts = await CommunityPost.find({})
            .populate('author', 'name businessName kitchenImage profileImage role')
            .populate('comments.author', 'name businessName profileImage role')
            .sort({ createdAt: -1 }); // Newest first
            
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Like or Unlike a post
// @route   PUT /api/community/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user already liked it
        const index = post.likes.indexOf(req.user._id);
        
        if (index === -1) {
            // Like
            post.likes.push(req.user._id);
        } else {
            // Unlike
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a comment to a post
// @route   POST /api/community/:id/comment
// @access  Private
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await CommunityPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = {
            author: req.user._id,
            text
        };

        post.comments.push(comment);
        await post.save();
        
        // Return fully populated comments
        await post.populate('comments.author', 'name businessName profileImage role');
        
        res.status(201).json(post.comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createPost,
    getPosts,
    likePost,
    addComment
};
