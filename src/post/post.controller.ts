import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { PostService } from './post.service';
import { v4 as uuidv4 } from 'uuid';
import { Observable, of } from 'rxjs';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import mongoose, { ObjectId } from 'mongoose';
import { CommentDto } from 'src/comment/dto';

@UseGuards(JwtGuard)
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('add-post')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
          const filename: string =
            path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  addPost(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('_id') userId: ObjectId,
    @Body('postCaption') caption: string,
  ) {
    return this.postService.addPost(file, userId, caption);
  }

  @Post('add-comment/:accountId/:postId')
  addComment(
    @GetUser('_id') commentAuthor: string,
    @Param('accountId') accountId: string,
    @Param('postId') postId: string,
    @Body() comment: CommentDto,
  ) {
    return this.postService.addComment(
      commentAuthor,
      accountId,
      postId,
      comment,
    );
  }

  @Post('like-or-unlike/:accountId/:postId')
  async likeOrUnlikeApost(
    @GetUser('_id') userId: string,
    @Param('accountId') accountId: string,
    @Param('postId') postId: string,
  ) {
    return this.postService.likeOrUnlikepost(userId, accountId, postId);
  }

  @Get('see-profile/:accountOwnerId')
  seeSomeonesProfile(
    @GetUser('_id') userId: string,
    @Param('accountOwnerId') accountId: string,
  ) {
    return this.postService.seeProfile(userId, accountId);
  }

  @Patch('edit-caption/:postId')
  async editCaption(
    @Param('postId') postId: string,
    @GetUser('_id') userId: string,
    @Body('newCaption') newCaption: string,
  ) {
    return this.postService.editCaption(postId, userId, newCaption);
  }

  @Get('see-post-by-id/:accountId/:postId')
  async seePostById(@GetUser('_id') userId: string, @Param('accountId') accountId: string, @Param('postId') postId: string) {
    return this.postService.seePostById(userId, accountId, postId);
  }

  @Delete('delete-post/:postId')
  async deletePost(
    @Param('postId') postId: string,
    @GetUser('_id') userId: string,
  ) {
    return this.postService.deletePost(postId, userId);
  }
}
