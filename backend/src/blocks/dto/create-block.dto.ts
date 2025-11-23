import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';
import { BlockType } from '../entities/block.entity';

export class CreateBlockDto {
  @IsEnum(BlockType)
  @IsNotEmpty()
  type: BlockType;

  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;

  @IsOptional()
  @IsUUID()
  pageId?: string | null;
}

