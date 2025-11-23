import { IsArray, IsString, IsOptional, IsUUID } from 'class-validator';

export class ReorderBlocksDto {
  @IsArray()
  @IsString({ each: true })
  blockIds: string[];

  @IsOptional()
  @IsUUID()
  pageId?: string | null;
}

