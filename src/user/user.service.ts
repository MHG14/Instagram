import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { ChangePasswordDto, ChangeUsernameDto, EditProfileDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  /////////////////////////////////////////////////////////////////////
  async follow(userId: string, userToFollowId: string) {
    try {
      if (mongoose.isObjectIdOrHexString(userToFollowId)) {
        const foundUser = await this.userModel.findOne({
          _id: new mongoose.Types.ObjectId(userId),
        });

        const userToFollow = await this.userModel.findOne({
          _id: new mongoose.Types.ObjectId(userToFollowId),
        });

        if (userToFollow) {
          if (userToFollow._id.toHexString() !== foundUser._id.toString()) {
            if (userToFollow.privacyStatus === 'public') {
              if (!foundUser.followings.includes(userToFollow.id)) {
                foundUser.followings.push(userToFollow);
                foundUser.save();
                userToFollow.followers.push(foundUser.id);
                userToFollow.save();
                return { message: `You followed ${userToFollow.username}` };
              } else {
                return {
                  message: `You are already following ${userToFollow.username}`,
                };
              }
            } else if (userToFollow.privacyStatus === 'private') {
              if (!foundUser.followingRequests.includes(userToFollow.id)) {
                foundUser.followingRequests.push(userToFollow.id);
                foundUser.save();
                userToFollow.followerRequests.push(foundUser.id);
                userToFollow.save();
                return {
                  message: `Follow request sent to ${userToFollow.username}`,
                };
              } else {
                return {
                  message: `You have already sent a friend request to ${userToFollow.username}`,
                };
              }
            }
          } else {
            return { message: 'Sorry! You can not follow yourself buddy' };
          }
        } else {
          return { message: 'This user does not exist' };
        }
      } else {
        return { message: 'Please enter a valid user id' };
      }
    } catch (error) {
      return { message: error.message };
    }
  }

  ////////////////////////////////////////////////////////////////////////

  async unfollow(userId: string, userToUnfollowId: string) {
    try {
      if (mongoose.isObjectIdOrHexString(userToUnfollowId)) {
        const foundUser = await this.userModel.findOne({
          _id: new mongoose.Types.ObjectId(userId),
        });

        const userToUnfollow = await this.userModel.findOne({
          _id: new mongoose.Types.ObjectId(userToUnfollowId),
        });

        if (!userToUnfollow) return { message: 'This user does not exist' };
        else if (userToUnfollow._id.toHexString() === foundUser._id.toString())
          return { message: "Sorry! You Can't unfollow yourself buddy" };
        else {
          if (foundUser.followings.includes(userToUnfollow.id)) {
            await foundUser.updateOne({
              $pull: { followings: userToUnfollow.id },
            });
            await userToUnfollow.updateOne({
              $pull: { followers: foundUser.id },
            });
            return {
              message: `You Successfully unfollowed ${userToUnfollow.username}`,
            };
          } else {
            return {
              message: `You are not following ${userToUnfollow.username}`,
            };
          }
        }
      } else {
        return { message: 'Please enter a valid user id' };
      }
    } catch (error) {
      return { message: error.message };
    }
  }
  /////////////////////////////////////////////////////////////////////
  async editProfile(user: string, data: EditProfileDto) {
    const foundUser = await this.userModel.findOne({ username: user });
    const updatedFields = await foundUser.updateOne(data);
    return { updatedFields };
  }
  //////////////////////////////////////////////////////////////////////
  async changeUsername(user: string, newUsername: ChangeUsernameDto) {
    const foundUser = await this.userModel.findOne({ username: user });
    if (user === newUsername.username)
      return { message: 'This is your current username! Choose a new one' };
    else {
      const duplicateUsername = await this.userModel.find({
        username: newUsername.username,
      });
      if (duplicateUsername[0])
        return { message: `This username is taken by someone else` };
      await foundUser.updateOne({ username: newUsername.username });
      return {
        message: `Username successfully updated to ${newUsername.username}`,
      };
    }
  }
  /////////////////////////////////////////////////////////////////
  async changePassword(user: string, newPassword: ChangePasswordDto) {
    const foundUser = await this.userModel.findOne({ username: user });
    const pwdMatches = await argon.verify(
      foundUser.password,
      newPassword.password,
    );
    if (pwdMatches)
      return { message: 'This is your current password, choose a new one' };
    // else if (newPassword.password.length < 8)
    //   return { message: 'Password must be at least 8 characters' };
    else {
      const newHashedPassword = await argon.hash(newPassword.password);
      console.log(newHashedPassword);
      await foundUser.updateOne({ password: newHashedPassword });
      return { message: 'Password successfully changed' };
    }
  }
  //////////////////////////////////////////////////
  async showFollowerRequests(userId: string) {
    const foundUser = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    return { followRequests: foundUser.followerRequests };
  }

  //////////////////////////////////////////////////
  async acceptFollowRequest(userId: string, requestedId: string) {
    if (mongoose.isObjectIdOrHexString(requestedId)) {
      const foundUser = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      const requestedUser = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(requestedId),
      });

      if (foundUser.followerRequests.includes(requestedId)) {
        await foundUser.updateOne({
          $pull: { followerRequests: requestedUser.id },
        });

        await requestedUser.updateOne({
          $pull: { followingRequests: foundUser.id },
        });

        await foundUser.updateOne({
          $push: { followers: requestedUser.id },
        });

        await requestedUser.updateOne({
          $push: { followings: requestedUser.id },
        });

        return {
          message: `You accepted ${requestedUser.username}'s follow request.`,
        };
      }
      return { message: `This user has not send you a follow request` };
    }

    return { message: `Please enter a valid user Id` };
  }
  //////////////////////////////////////////////////////

  async declineFollowRequest(userId: string, requestedId: string) {
    if (mongoose.isObjectIdOrHexString(requestedId)) {
      const foundUser = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      const requestedUser = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(requestedId),
      });

      if (foundUser.followerRequests.includes(requestedId)) {
        await foundUser.updateOne({
          $pull: { followerRequests: requestedUser.id },
        });

        await requestedUser.updateOne({
          $pull: { followingRequests: foundUser.id },
        });

        return {
          message: `You declined ${requestedUser.username}'s follow request.`,
        };
      }
      return { message: `This user has not send you a follow request` };
    }

    return { message: `Please enter a valid user Id` };
  }

  //////////////////////////////////////////////////
  async changePrivacyStatus(userId: string) {
    if (mongoose.isObjectIdOrHexString(userId)) {
      const foundUser = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      if (!foundUser) return { message: 'This user does not exist' };
      if (foundUser.privacyStatus === 'public') {
        await foundUser.updateOne({ privacyStatus: 'private' });
        return { message: 'Your account is now private' };
      } else if (foundUser.privacyStatus === 'private') {
        await foundUser.updateOne({ privacyStatus: 'public' });
        return { message: 'Your account is now public' };
      }
    }
    return { message: 'This user does not exist' };
  }
  /////////////////////////////////////////////////////
  async blockUser(userId: string, userToBlockId: string) {
    const foundUser = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    const userToBlock = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userToBlockId),
    });
    await foundUser.updateOne({
      $pull: { followings: userToBlock.id, followers: userToBlock.id },
    });
    await foundUser.updateOne({
      $push: { blockedUsers: userToBlock.id},
    });
    console.log('salam')

  }
}
