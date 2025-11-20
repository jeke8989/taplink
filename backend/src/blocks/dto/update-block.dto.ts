import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { BlockType } from '../entities/block.entity';

export class UpdateBlockDto {
  @IsEnum(BlockType)
  @IsOptional()
  type?: BlockType;

  @IsObject()
  @IsOptional()
  content?: Record<string, any>;
}

