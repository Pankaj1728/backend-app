import express from 'express';
import {
    createPost,
    publishPost,
    getPosts,
    reactToPost,
    likePost,
    addComment,
    replyToComment,
    editPost,
    deletePost,
    likeComment,
    likeReply,
    getPostReactions,
    getCommentLikes,
    getReplyLikes
} from '../controllers/postController';
import { authenticate, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.use(authenticate);

// Create post (Admin only) - supports image/video upload
router.post('/', authorize('admin'), upload.single('media'), createPost);

// Edit post (Admin only)
router.put('/:id', authorize('admin'), upload.single('media'), editPost);

// Publish post (Admin only)
router.patch('/:id/publish', authorize('admin'), publishPost);

// Get all published posts
router.get('/', getPosts);

// React to a post (with emoji)
router.post('/:id/react', reactToPost);

// Get users who reacted to a post
router.get('/:id/reactions', getPostReactions);

// Like/unlike a post (backward compatibility)
router.post('/:id/like', likePost);

// Add comment to post
router.post('/:id/comment', addComment);

// Reply to a comment
router.post('/:id/comment/:commentId/reply', replyToComment);

// Like/unlike a comment
router.post('/:id/comment/:commentId/like', likeComment);

// Get users who liked a comment
router.get('/:id/comment/:commentId/likes', getCommentLikes);

// Like/unlike a reply
router.post('/:id/comment/:commentId/reply/:replyIndex/like', likeReply);

// Get users who liked a reply
router.get('/:id/comment/:commentId/reply/:replyIndex/likes', getReplyLikes);

// Delete post (Admin only)
router.delete('/:id', authorize('admin'), deletePost);

export default router;
