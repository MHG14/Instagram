import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { CommentDto } from 'src/comment/dto/comment.dto';
import { CommentType } from 'src/comment/type';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: function (val) {
        return val.length >= 3;
      },
      message: () => `Username must be at least 3 characters`,
    },
  })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    required: true,
    validate: {
      validator: function (val: string) {
        return val.length >= 8;
      },
      message: () => `Password must be at least 8 characters`,
    },
  })
  password: string;

  @Prop({ required: true, min: 1, max: 120 })
  age: number;

  @Prop()
  profilePictureURL: string;

  @Prop({ type: String, enum: ['male', 'female'] })
  gender: string;

  @Prop({
    required: true,
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  })
  privacyStatus: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  followings: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  followers: User[];

  @Prop({ type: Array<CommentType> })
  comments: CommentType[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  followerRequests: string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  followingRequests: string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  blockedUsers: string[]
}

export const UserSchema = SchemaFactory.createForClass(User);
