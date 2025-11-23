import { IsNotEmpty, IsString, IsOptional, Matches, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug может содержать только строчные буквы, цифры и дефисы',
  })
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  registrationForm?: unknown;

  @IsOptional()
  @IsObject()
  tickets?: unknown;

  @IsOptional()
  @IsObject()
  discounts?: unknown;

  @IsOptional()
  @IsObject()
  publicationSettings?: unknown;
}

