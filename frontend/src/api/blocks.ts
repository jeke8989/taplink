import api from './axios';

export enum BlockType {
  TEXT = 'text',
  LINK = 'link',
  AVATAR = 'avatar',
  DIVIDER = 'divider',
  QA = 'qa',
  ICON_TEXT = 'icon_text',
  MESSENGERS = 'messengers',
  SOCIAL_NETWORKS = 'social_networks',
  MAP = 'map',
  CUSTOM = 'custom',
}

export interface Block {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockDto {
  type: BlockType;
  content: Record<string, any>;
}

export interface UpdateBlockDto {
  type?: BlockType;
  content?: Record<string, any>;
}

export interface ReorderBlocksDto {
  blockIds: string[];
}

export const getBlocks = async (): Promise<Block[]> => {
  const response = await api.get<Block[]>('/blocks');
  return response.data;
};

export const createBlock = async (data: CreateBlockDto): Promise<Block> => {
  const response = await api.post<Block>('/blocks', data);
  return response.data;
};

export const updateBlock = async (
  id: string,
  data: UpdateBlockDto,
): Promise<Block> => {
  const response = await api.put<Block>(`/blocks/${id}`, data);
  return response.data;
};

export const deleteBlock = async (id: string): Promise<void> => {
  await api.delete(`/blocks/${id}`);
};

export const reorderBlocks = async (blockIds: string[]): Promise<Block[]> => {
  const response = await api.put<Block[]>('/blocks/reorder/bulk', { blockIds });
  return response.data;
};

