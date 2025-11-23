import { IsOptional, IsString, Matches, IsObject } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug может содержать только строчные буквы, цифры и дефисы',
  })
  slug?: string;

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

