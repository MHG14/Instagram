import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class PostDto {
  @IsOptional()
  @IsString()
  postCaption: string;
}
