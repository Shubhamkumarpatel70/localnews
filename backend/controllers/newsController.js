const News = require('../models/News');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

exports.createNews = async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const news = new News({
      title,
      content,
      image,
      author: req.user.id,
    });
    await news.save();
    // Notify all followers
    const author = await User.findById(req.user.id);
    if (author.followers && author.followers.length > 0) {
      await Promise.all(author.followers.map(followerId =>
        createNotification({
          user: followerId,
          type: 'upload',
          message: `${author.username} uploaded a new news: "${news.title}"`,
        })
      ));
    }
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().populate('author', 'username avatar').sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTrendingNews = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
    const news = await News.find({ createdAt: { $gte: since } })
      .populate('author', 'username avatar')
      .lean();
    news.forEach(n => {
      n.engagement = (n.likes?.length || 0) + (n.shares?.length || 0);
    });
    news.sort((a, b) => b.engagement - a.engagement);
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'username avatar');
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    if (news.author.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    const { title, content } = req.body;
    if (title) news.title = title;
    if (content) news.content = content;
    if (req.file) news.image = `/uploads/${req.file.filename}`;
    await news.save();
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    if (news.author.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    await news.deleteOne();
    res.json({ message: 'News deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.likeNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    let liked = false;
    if (!news.likes.includes(req.user.id)) {
      news.likes.push(req.user.id);
      liked = true;
      // Notify author if not self
      if (news.author.toString() !== req.user.id) {
        await createNotification({
          user: news.author,
          type: 'like',
          message: `Your news "${news.title}" was liked.`,
        });
      }
    } else {
      news.likes = news.likes.filter(id => id.toString() !== req.user.id);
    }
    await news.save();
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.saveNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    let saved;
    if (!news.savedBy.includes(req.user.id)) {
      news.savedBy.push(req.user.id);
      saved = true;
    } else {
      news.savedBy = news.savedBy.filter(id => id.toString() !== req.user.id);
      saved = false;
    }
    await news.save();
    res.json({ saved, savedCount: news.savedBy.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.shareNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    let shared = false;
    if (!news.shares.includes(req.user.id)) {
      news.shares.push(req.user.id);
      shared = true;
      // Notify author if not self
      if (news.author.toString() !== req.user.id) {
        await createNotification({
          user: news.author,
          type: 'share',
          message: `Your news "${news.title}" was shared.`,
        });
      }
    }
    await news.save();
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 