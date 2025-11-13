const Comment = require('../models/Comment');
const News = require('../models/News');
const Post = require('../models/Post');
const Video = require('../models/Video');
const { createNotification } = require('./notificationController');

exports.addComment = async (req, res) => {
  try {
    const { text, type } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });
    if (!type || !['post', 'news', 'community', 'video'].includes(type)) {
      return res.status(400).json({ message: 'Invalid comment type' });
    }
    if (type === 'post') {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      const comment = new Comment({
        post: post._id,
        author: req.user.id,
        content: text,
      });
      await comment.save();
      post.comments.push(comment._id);
      await post.save();
      res.status(201).json(comment);
    } else if (type === 'news') {
      const news = await News.findById(req.params.id);
      if (!news) return res.status(404).json({ message: 'News not found' });
      const comment = new Comment({
        news: news._id,
        author: req.user.id,
        content: text,
      });
      await comment.save();
      // Notify author if not self
      if (news.author.toString() !== req.user.id) {
        await createNotification({
          user: news.author,
          type: 'comment',
          message: `Your news \"${news.title}\" received a new comment.`,
        });
      }
      news.comments.push(comment._id);
      await news.save();
      res.status(201).json(comment);
    } else if (type === 'community') {
      const CommunityPost = require('../models/CommunityPost');
      const communityPost = await CommunityPost.findById(req.params.id);
      if (!communityPost) return res.status(404).json({ message: 'Community post not found' });
      const comment = new Comment({
        communityPost: communityPost._id,
        author: req.user.id,
        content: text,
      });
      await comment.save();
      communityPost.comments.push(comment._id);
      await communityPost.save();
      res.status(201).json(comment);
    } else if (type === 'video') {
      const video = await Video.findById(req.params.id);
      if (!video) return res.status(404).json({ message: 'Video not found' });
      const comment = new Comment({
        video: video._id,
        author: req.user.id,
        content: text,
      });
      await comment.save();
      video.comments.push(comment._id);
      await video.save();
      res.status(201).json(comment);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { type } = req.query;
    if (type === 'post') {
      const comments = await Comment.find({ post: req.params.id })
        .populate('author', 'username avatar')
        .sort({ createdAt: 1 });
      res.json(comments);
    } else if (type === 'news') {
      const comments = await Comment.find({ news: req.params.id })
        .populate('author', 'username avatar')
        .sort({ createdAt: 1 });
      res.json(comments);
    } else if (type === 'community') {
      const comments = await Comment.find({ communityPost: req.params.id })
        .populate('author', 'username avatar')
        .sort({ createdAt: 1 });
      res.json(comments);
    } else if (type === 'video') {
      const comments = await Comment.find({ video: req.params.id })
        .populate('author', 'username avatar')
        .sort({ createdAt: 1 });
      res.json(comments);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 