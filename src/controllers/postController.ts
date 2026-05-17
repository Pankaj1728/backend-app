import { Response } from 'express';
import Post from '../models/Post';
import { AuthRequest } from '../middlewares/auth';
import { ActivityService } from '../services/activityService';
import { NotificationService } from '../services/notificationService';

// Create a new post (Admin only)
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { content, mentions, tags } = req.body;
        const mediaFile = req.file;

        if (!content) {
            res.status(400).json({ message: 'Content is required' });
            return;
        }

        // Parse mentions and tags if they're strings
        const mentionIds = mentions ? (typeof mentions === 'string' ? JSON.parse(mentions) : mentions) : [];
        const tagList = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

        const post = new Post({
            author: req.user!.id,
            authorName: req.user!.name || 'Admin',
            authorProfilePic: req.user!.profilePic,
            content,
            mentions: mentionIds,
            tags: tagList,
            mediaType: mediaFile ? (mediaFile.mimetype.startsWith('video') ? 'video' : 'image') : undefined,
            mediaUrl: mediaFile ? mediaFile.filename : undefined,
            isPublished: true // Auto-publish
        });

        await post.save();

        await ActivityService.logActivity(
            'post_created',
            req.user!,
            `Created a new post: ${content.substring(0, 50)}...`,
            undefined,
            { postId: post._id.toString(), content: content.substring(0, 50) }
        );

        // Send notifications
        // 1. Notify all staff about new post
        await NotificationService.notifyNewPost(
            req.user!.id,
            req.user!.name || 'Admin',
            req.user!.profilePic,
            post._id.toString(),
            content.substring(0, 100)
        );

        // 2. Notify mentioned users
        if (mentionIds.length > 0) {
            await NotificationService.notifyMentions(
                req.user!.id,
                req.user!.name || 'Admin',
                req.user!.profilePic,
                mentionIds,
                post._id.toString(),
                `${req.user!.name} mentioned you in a post`
            );
        }

        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error: any) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Publish a post (Admin only)
export const publishPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        post.isPublished = true;
        await post.save();

        await ActivityService.logActivity(
            'post_published',
            req.user!,
            `Published a post: ${post.content.substring(0, 50)}...`,
            undefined,
            { postId: post._id.toString(), content: post.content.substring(0, 50) }
        );

        res.json({ message: 'Post published successfully', post });
    } catch (error: any) {
        console.error('Publish post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all published posts
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const posts = await Post.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ posts });
    } catch (error: any) {
        console.error('Get posts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Edit a post (Admin only)
export const editPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const mediaFile = req.file;

        const post = await Post.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        if (content) {
            post.content = content;
        }

        if (mediaFile) {
            post.mediaType = mediaFile.mimetype.startsWith('video') ? 'video' : 'image';
            post.mediaUrl = mediaFile.filename;
        }

        await post.save();

        await ActivityService.logActivity(
            'profile_updated',
            req.user!,
            `Edited a post`,
            undefined,
            { postId: post._id.toString() }
        );

        res.json({ message: 'Post updated successfully', post });
    } catch (error: any) {
        console.error('Edit post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// React to a post (like, love, haha, wow, sad, angry)
export const reactToPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;
        const userId = req.user!.id;

        if (!['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(emoji)) {
            res.status(400).json({ message: 'Invalid emoji' });
            return;
        }

        const post = await Post.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const existingReactionIndex = post.reactions.findIndex(r => r.user.toString() === userId);

        if (existingReactionIndex > -1) {
            // User already reacted
            if (post.reactions[existingReactionIndex].emoji === emoji) {
                // Remove reaction if same emoji
                post.reactions.splice(existingReactionIndex, 1);
            } else {
                // Update to new emoji
                post.reactions[existingReactionIndex].emoji = emoji as any;
                // Notify post author
                await NotificationService.notifyPostLike(
                    userId,
                    req.user!.name || 'User',
                    req.user!.profilePic,
                    post.author.toString(),
                    post._id.toString()
                );
            }
        } else {
            // Add new reaction
            post.reactions.push({ user: userId as any, emoji: emoji as any });
            // Notify post author
            await NotificationService.notifyPostLike(
                userId,
                req.user!.name || 'User',
                req.user!.profilePic,
                post.author.toString(),
                post._id.toString()
            );
        }

        await post.save();
        res.json({ message: 'Reaction updated', reactions: post.reactions });
    } catch (error: any) {
        console.error('React to post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Like a post (kept for backward compatibility)
export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const post = await Post.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const existingReactionIndex = post.reactions.findIndex(r => r.user.toString() === userId);

        if (existingReactionIndex > -1 && post.reactions[existingReactionIndex].emoji === 'like') {
            // Remove like
            post.reactions.splice(existingReactionIndex, 1);
        } else if (existingReactionIndex > -1) {
            // Change to like
            post.reactions[existingReactionIndex].emoji = 'like';
        } else {
            // Add like
            post.reactions.push({ user: userId as any, emoji: 'like' });
        }

        await post.save();
        const likeCount = post.reactions.filter(r => r.emoji === 'like').length;
        res.json({ message: 'Post updated', likes: likeCount, liked: existingReactionIndex === -1 });
    } catch (error: any) {
        console.error('Like post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add comment to post
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) {
            res.status(400).json({ message: 'Comment text is required' });
            return;
        }

        const post = await Post.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const comment = {
            user: req.user!.id as any,
            userName: req.user!.name || 'User',
            userProfilePic: req.user!.profilePic,
            text,
            likes: [],
            replies: [],
            createdAt: new Date()
        };

        post.comments.push(comment as any);
        await post.save();

        res.json({ message: 'Comment added successfully', comment });
    } catch (error: any) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reply to a comment
export const replyToComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, commentId } = req.params;
        const { text, mentions } = req.body;

        if (!text) {
            res.status(400).json({ message: 'Reply text is required' });
            return;
        }

        const post = await Post.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const comment = post.comments.find(c => c._id?.toString() === commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        // Parse mentions if provided
        const mentionIds = mentions || [];

        const reply = {
            user: req.user!.id as any,
            userName: req.user!.name || 'User',
            userProfilePic: req.user!.profilePic,
            text,
            mentions: mentionIds,
            likes: [],
            createdAt: new Date()
        };

        comment.replies.push(reply);
        await post.save();

        // Notify comment author
        await NotificationService.notifyCommentReply(
            req.user!.id,
            req.user!.name || 'User',
            req.user!.profilePic,
            comment.user.toString(),
            post._id.toString(),
            commentId as string
        );

        // Notify mentioned users in reply
        if (mentionIds.length > 0) {
            await NotificationService.notifyMentions(
                req.user!.id,
                req.user!.name || 'User',
                req.user!.profilePic,
                mentionIds,
                post._id.toString(),
                `${req.user!.name} mentioned you in a reply`
            );
        }

        res.json({ message: 'Reply added successfully', reply });
    } catch (error: any) {
        console.error('Reply to comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a post (Admin only)
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        await ActivityService.logActivity(
            'post_deleted',
            req.user!,
            `Deleted a post`,
            undefined,
            { postId: post._id.toString() }
        );

        res.json({ message: 'Post deleted successfully' });
    } catch (error: any) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Like a comment
export const likeComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, commentId } = req.params;
        const userId = req.user!.id;

        const post = await Post.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const comment = post.comments.find(c => c._id?.toString() === commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        const likeIndex = comment.likes.findIndex(likeUserId => likeUserId.toString() === userId);

        if (likeIndex > -1) {
            // Unlike
            comment.likes.splice(likeIndex, 1);
        } else {
            // Like
            comment.likes.push(userId as any);
            // Notify comment author
            await NotificationService.notifyCommentLike(
                userId,
                req.user!.name || 'User',
                req.user!.profilePic,
                comment.user.toString(),
                post._id.toString(),
                commentId as string
            );
        }

        await post.save();
        res.json({ message: 'Comment like updated', likes: comment.likes.length });
    } catch (error: any) {
        console.error('Like comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Like a reply
export const likeReply = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, commentId, replyIndex } = req.params;
        const userId = req.user!.id;

        const post = await Post.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const comment = post.comments.find(c => c._id?.toString() === commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        const index = Array.isArray(replyIndex) ? parseInt(replyIndex[0]) : parseInt(replyIndex);
        const reply = comment.replies[index];
        if (!reply) {
            res.status(404).json({ message: 'Reply not found' });
            return;
        }

        const likeIndex = reply.likes.findIndex(likeUserId => likeUserId.toString() === userId);

        if (likeIndex > -1) {
            // Unlike
            reply.likes.splice(likeIndex, 1);
        } else {
            // Like
            reply.likes.push(userId as any);
            // Notify reply author
            await NotificationService.notifyReplyLike(
                userId,
                req.user!.name || 'User',
                req.user!.profilePic,
                reply.user.toString(),
                post._id.toString(),
                commentId as string
            );
        }

        await post.save();
        res.json({ message: 'Reply like updated', likes: reply.likes.length });
    } catch (error: any) {
        console.error('Like reply error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get users who reacted to a post
export const getPostReactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id).populate('reactions.user', 'name email profilePic role');
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        res.json({ reactions: post.reactions });
    } catch (error: any) {
        console.error('Get post reactions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get users who liked a comment
export const getCommentLikes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, commentId } = req.params;

        const post = await Post.findById(id).populate('comments.likes', 'name email profilePic role');
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const comment = post.comments.find(c => c._id?.toString() === commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        res.json({ likes: comment.likes });
    } catch (error: any) {
        console.error('Get comment likes error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get users who liked a reply
export const getReplyLikes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id, commentId, replyIndex } = req.params;

        const post = await Post.findById(id).populate('comments.replies.likes', 'name email profilePic role');
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const comment = post.comments.find(c => c._id?.toString() === commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        const index = Array.isArray(replyIndex) ? parseInt(replyIndex[0]) : parseInt(replyIndex);
        const reply = comment.replies[index];
        if (!reply) {
            res.status(404).json({ message: 'Reply not found' });
            return;
        }

        res.json({ likes: reply.likes });
    } catch (error: any) {
        console.error('Get reply likes error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
