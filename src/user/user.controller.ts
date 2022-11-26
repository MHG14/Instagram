import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Get,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { ChangePasswordDto, ChangeUsernameDto, EditProfileDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('follow/:userId')
  async follow(
    @GetUser('_id') userId: string,
    @Param('userId') userToFollow: string,
  ) {
    return await this.userService.follow(userId, userToFollow);
  }

  @Post('unfollow/:userId')
  async unfollowSomeone(
    @GetUser('_id') userId: string,
    @Param('userId') userToUnfollow: string,
  ) {
    return await this.userService.unfollow(userId, userToUnfollow);
  }

  @Post('edit-profile')
  async editProfile(
    @GetUser('username') user: string,
    @Body() data: EditProfileDto,
  ) {
    return this.userService.editProfile(user, data);
  }

  @Post('change-username')
  async changeUsername(
    @GetUser('username') user: string,
    @Body() newUsername: ChangeUsernameDto,
  ) {
    return this.userService.changeUsername(user, newUsername);
  }

  @Post('change-password')
  async changePassword(
    @GetUser('username') user: string,
    @Body() newPassword: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user, newPassword);
  }

  @Get('show-follow-requests')
  async showFollowerRequests(@GetUser('_id') userId: string) {
    return this.userService.showFollowerRequests(userId);
  }

  @Post('accept-follow-request/:requestedId')
  acceptFollowRequests(
    @GetUser('_id') userId: string,
    @Param('requestedId') requestedId: string,
  ) {
    return this.userService.acceptFollowRequest(userId, requestedId);
  }

  @Post('decline-follow-request/:requestedId')
  declineFollowRequests(
    @GetUser('_id') userId: string,
    @Param('requestedId') requestedId: string,
  ) {
    return this.userService.declineFollowRequest(userId, requestedId);
  }

  @Patch('change-privacy-status')
  async changePrivacyStatus(@GetUser('_id') userId: string) {
    return this.userService.changePrivacyStatus(userId);
  }
}
