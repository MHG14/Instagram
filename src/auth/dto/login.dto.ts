import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class loginDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}