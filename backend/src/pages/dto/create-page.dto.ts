import { IsNotEmpty, IsString, IsOptional, Matches, ValidateIf } from 'class-validator';

export class CreatePageDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @ValidateIf((o) => o.slug !== null && o.slug !== undefined && o.slug !== '')
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug может содержать только строчные буквы, цифры и дефисы',
  })
  slug?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;
}

