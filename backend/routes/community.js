const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CommunityPost = require('../models/CommunityPost');

// Get all community posts
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublished: true };
    if (category) {
      query.category = category;
    }
    
    const posts = await CommunityPost.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await CommunityPost.countDocuments(query);
    
    res.json({
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all community posts saved by the logged-in user
router.get('/saved', auth, async (req, res) => {
  try {
    const posts = await CommunityPost.find({ savedBy: req.user.id })
      .populate('author', 'username avatar')
      .populate('comments')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching saved community posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top hashtags
router.get('/top-tags', async (req, res) => {
  try {
    const tagsAgg = await CommunityPost.aggregate([
      { $match: { tags: { $exists: true, $ne: null, $not: { $size: 0 } } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(tagsAgg.map(t => ({ tag: t._id, count: t.count })));
  } catch (error) {
    console.error('Error fetching top tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get community post by ID
router.get('/:id', async (req, res) => {
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid community post ID' });
  }
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('comments');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new community post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, images, tags, location, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const post = new CommunityPost({
      title,
      content,
      images: images || [],
      tags: tags || [],
      location,
      category,
      author: req.user.id
    });
    
    await post.save();
    
    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'username avatar');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update community post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, content, images, tags, location, category } = req.body;
    
    post.title = title || post.title;
    post.content = content || post.content;
    post.images = images || post.images;
    post.tags = tags || post.tags;
    post.location = location || post.location;
    post.category = category || post.category;
    
    await post.save();
    
    const updatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'username avatar');
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete community post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await CommunityPost.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike community post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ liked: !isLiked, likesCount: post.likes.length });
  } catch (error) {
    console.error('Error liking community post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all community posts by the logged-in user
router.get('/mine', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Not authenticated' });
    const posts = await CommunityPost.find({ author: req.user.id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user community posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top hashtags
router.get('/top-tags', async (req, res) => {
  try {
    const tagsAgg = await CommunityPost.aggregate([
      { $match: { tags: { $exists: true, $ne: null, $not: { $size: 0 } } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(tagsAgg.map(t => ({ tag: t._id, count: t.count })));
  } catch (error) {
    console.error('Error fetching top tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 