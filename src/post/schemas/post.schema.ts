import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { CommentDto } from 'src/comment/dto/comment.dto';
import { User } from '../../user/schemas';
import { CommentType } from 'src/comment/type';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ required: true })
  postPictureURL: string;

  @Prop({ required: false })
  postCaption: string;

  @Prop({ required: true, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Array<CommentType> })
  comments: CommentType[];
 

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  likes: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
