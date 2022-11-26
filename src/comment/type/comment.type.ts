import mongoose from 'mongoose';

export type CommentType = {
  commentId: mongoose.Types.ObjectId;
  commentedBy: { type: mongoose.Schema.Types.ObjectId; ref: 'User' };
  commentContent: string;
  replies: Comment[];
};
