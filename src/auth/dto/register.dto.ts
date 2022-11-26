import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsEmail,
    IsOptional,
    MinLength,
  } from 'class-validator';
  
  export class registerDto {
    @IsNotEmpty()
    @IsString()
    fullName: string;
  
    @IsNotEmpty()
    @IsString()
    username: string;
  
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string;
  
    @IsNumber()
    age?: number;
  
    @IsString()
    @IsOptional()
    gender?: string;
  
    @IsString()
    @IsOptional()
    profilePictureURL?: string;
  }