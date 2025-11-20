import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { BlockType } from '../entities/block.entity';

export class CreateBlockDto {
  @IsEnum(BlockType)
  @IsNotEmpty()
  type: BlockType;

  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;
}

