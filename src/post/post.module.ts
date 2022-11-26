import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostSchema } from './schemas/post.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { UserSchema } from 'src/user/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
