import mongoose, { ObjectId } from 'mongoose';
import { User } from '../../user/schemas';

export class CommentDto {
  commentContent: string;
}
