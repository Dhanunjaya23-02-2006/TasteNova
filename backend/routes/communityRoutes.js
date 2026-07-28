const express = require('express');
const router = express.Router();
const { createPost, getPosts, likePost, addComment } = require('../controllers/communityController');
const { protect, chef } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, chef, getPosts)
    .post(protect, chef, createPost);

router.route('/:id/like')
    .put(protect, likePost);

router.route('/:id/comment')
    .post(protect, addComment);

module.exports = router;
