const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const newsController = require('../controllers/newsController');
const News = require('../models/News'); // Added this import for the new endpoint

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Public
router.get('/', newsController.getAllNews);
router.get('/trending', newsController.getTrendingNews);
router.get('/:id', newsController.getNewsById);

// Protected
router.post('/', auth, upload.single('image'), newsController.createNews);
router.put('/:id', auth, upload.single('image'), newsController.updateNews);
router.delete('/:id', auth, newsController.deleteNews);
router.post('/:id/like', auth, newsController.likeNews);
router.post('/:id/save', auth, newsController.saveNews);
router.post('/:id/share', auth, newsController.shareNews);

// Get all news saved by the logged-in user
router.get('/saved', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.json([]);
    const news = await News.find({ savedBy: req.user.id })
      .populate('author', 'username avatar')
      .populate('comments')
      .sort({ createdAt: -1 });
    res.json(news || []);
  } catch (error) {
    console.error('Error fetching saved news:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 