const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const commentController = require('../controllers/commentController');

router.post('/:id/comment', auth, commentController.addComment);
router.get('/:id/comments', commentController.getComments);

module.exports = router; 