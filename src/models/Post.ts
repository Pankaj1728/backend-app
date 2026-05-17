import mongoose, { Document, Schema } from 'mongoose';

export interface IReply {
    user: mongoose.Types.ObjectId;
    userName: string;
    userProfilePic?: string;
    text: string;
    mentions: mongoose.Types.ObjectId[];
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
}

export interface IComment {
    _id?: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    userName: string;
    userProfilePic?: string;
    text: string;
    likes: mongoose.Types.ObjectId[];
    replies: IReply[];
    createdAt: Date;
}

export interface IReaction {
    user: mongoose.Types.ObjectId;
    emoji: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
}

export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    authorName: string;
    authorProfilePic?: string;
    content: string;
    mediaType?: 'image' | 'video';
    mediaUrl?: string;
    mentions: mongoose.Types.ObjectId[];
    tags: string[];
    reactions: IReaction[];
    comments: IComment[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReplySchema = new Schema<IReply>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userProfilePic: { type: String },
    text: { type: String, required: true },
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const CommentSchema = new Schema<IComment>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userProfilePic: { type: String },
    text: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replies: [ReplySchema],
    createdAt: { type: Date, default: Date.now }
});

const ReactionSchema = new Schema<IReaction>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'], required: true }
});

const PostSchema = new Schema<IPost>({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorProfilePic: { type: String },
    content: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'] },
    mediaUrl: { type: String },
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String }],
    reactions: [ReactionSchema],
    comments: [CommentSchema],
    isPublished: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<IPost>('Post', PostSchema);
