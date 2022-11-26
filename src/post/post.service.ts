import { Injectable, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExpressAdapter, FileInterceptor } from '@nestjs/platform-express';
import mongoose, { Model, ObjectId } from 'mongoose';
import { diskStorage } from 'multer';
import { PostDto } from './dto';
import { Post } from './schemas/post.schema';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Observable, of } from 'rxjs';
import { User } from 'src/user/schemas';
import { CommentDto } from 'src/comment/dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  getImagePath(file: Express.Multer.File) {
    return { imagePath: file.path };
  }

  async addPost(file: Express.Multer.File, userId: ObjectId, caption?: any) {
    const imagePath = this.getImagePath(file);
    const post = await this.postModel.create({
      postPictureURL: imagePath.imagePath,
      postCaption: caption,
      userId: userId,
    });
    return post;
  }
  ////////////////////////////////////////////////////
  async deletePost(postId: string, userId: string) {
    if (mongoose.isObjectIdOrHexString(postId)) {
      const foundPost = await this.postModel.findOne({
        _id: new mongoose.Types.ObjectId(postId),
      });
      if (!foundPost) return { message: 'This post does not exist' };
      await foundPost.deleteOne();
      return { message: 'Post deleted successfully' };
    }

    return { message: 'This post does not exist' };
  }
  ////////////////////////////////////////////////////
  async editCaption(postId: string, userId: string, newCaption: string) {
    if (mongoose.isObjectIdOrHexString(postId)) {
      const foundPost = await this.postModel.findOne({
        _id: new mongoose.Types.ObjectId(postId),
      });
      if (!foundPost) return { message: 'This post does not exist' };
      console.log(foundPost);
      await foundPost.updateOne({ postCaption: newCaption });
      return { message: `Caption updated to '${newCaption}'` };
    } else {
      return { message: 'This post does not exist' };
    }
  }
  /////////////////////////////////////////////////
  async addComment(
    commentAuthor: string,
    accountId: string,
    postId: string,
    commentDto: CommentDto,
  ) {
    const foundUser = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(commentAuthor),
    });
    const postOwnerAccount = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(accountId),
    });
    const post = await this.postModel.findOne({
      _id: new mongoose.Types.ObjectId(postId),
    }).populate('userId')
    return post;

    if (post) {
      if (
        foundUser.followings.includes(postOwnerAccount.id) ||
        postOwnerAccount.privacyStatus === 'public'
      ) {
        const comment = {
          commentId: new mongoose.Types.ObjectId(),
          commentedBy: new mongoose.Types.ObjectId(commentAuthor),
          commentContent: commentDto.commentContent,
          replies: [],
        };
        await foundUser.updateOne({
          $push: { comments: comment },
        });
        await post.updateOne({
          $push: { comments: comment },
        });
        return comment;
      }
      return { message: 'This account is private' };
    }
    return { message: 'This post does not exist' };
  }

  /////////////////////////////////////////////////
  async likeOrUnlikepost(
    userId: string,
    accountOwnerId: string,
    postId: string,
  ) {
    const foundUser = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    const accountOwner = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(accountOwnerId),
    });
    const post = await this.postModel.findOne({
      _id: new mongoose.Types.ObjectId(postId),
    });
    if (post) {
      if (
        accountOwner.privacyStatus === 'public' ||
        foundUser.followings.includes(accountOwner.id)
      ) {
        if (post.likes.includes(foundUser.id)) {
          await post.updateOne({
            $pull: { likes: foundUser.id },
          });
          return { message: 'Post is unliked' };
        } else {
          await post.updateOne({
            $push: { likes: foundUser.id },
          });
          return { message: 'Post is liked' };
        }
      }
    }
  }
  //////////////////////////////////////////////////

  async seeProfile(userId: string, accountId: string) {
    const foundUser = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(accountId),
    });
    const completePosts = await this.postModel.find({
      userId: new mongoose.Types.ObjectId(accountId),
    });
    const posts = completePosts.map((post) => {
      return {
        postURL: post.postPictureURL,
      };
    });

    const result = {
      name: foundUser.fullName,
      username: foundUser.username,
      numberOfPosts: posts.length,
      followers: foundUser.followers.length,
      followings: foundUser.followings.length,
      posts,
    };
    return result;
  }

  //////////////////////////////////////
  async seePostById(userId: string, accountId: string, postId: string) {
    const foundUser = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    const accountOwner = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(accountId),
    });
    const post = await this.postModel.findOne({
      _id: new mongoose.Types.ObjectId(postId),
    }).populate('userId');

    if (post) {
      if (
        accountOwner.privacyStatus === 'public' ||
        foundUser.followings.includes(accountOwner.id)
      ) {
        const result = {
          postURL: post.postPictureURL,
          postComments: post.comments.map((comment) => {
            return {
              commentedBy: comment.commentedBy,
              commentContent: comment.commentContent,
            };
          }),
          postLikes: post.likes.length,
          postcreatedAt: post.createdAt,
        };
        return result;
      }
    }
    return { message: 'This post does not exist' };
  }
}
