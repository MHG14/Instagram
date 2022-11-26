import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { loginDto, registerDto } from './dto';
import * as argon from 'argon2';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: registerDto) {
    try {
      const foundUser = this.userModel.find({ email: dto.email });
      if (foundUser[0]) return 'You already have an account';
      const hashedPaaword = await argon.hash(dto.password);
      dto.password = hashedPaaword;
      const createdUser = await this.userModel.create(dto);
      return this.signToken(dto.email);
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  async login(dto: loginDto) {
    {
      // find the user by email
      const foundUser = await this.userModel.find({ email: dto.email });
      // if user does not exist throw an exception
      if (!foundUser[0]) throw new ForbiddenException('Credentials incorrect');
      // compare password
      const pwdMatches = await argon.verify(
        foundUser[0].password,
        dto.password,
      );
      // if password was wrong throw an exception
      if (!pwdMatches) throw new ForbiddenException('Credentials incorrect');
      // return the JWT
      return this.signToken(foundUser[0].email);
    }
  }

  async signToken(email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: email,
    };

    const accessTokenSecret = this.config.get('ACCESS_TOKEN_SECRET');

    const JWToken = await this.jwt.signAsync(payload, {
      expiresIn: '30d',
      secret: accessTokenSecret,
    });

    return {
      access_token: JWToken,
    };
  }
}
