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
  IMAGE_CAROUSEL = 'image_carousel',
  DATE_TIME = 'date_time',
  EVENT_DATE_TIME = 'event_date_time',
  EVENT_LOCATION = 'event_location',
  EVENT_REGISTRATION = 'event_registration',
  EVENT_SCHEDULE = 'event_schedule',
  EVENT_SPEAKERS = 'event_speakers',
  EVENT_PRICE = 'event_price',
  EVENT_GALLERY = 'event_gallery',
  EVENT_TICKET_SALE = 'event_ticket_sale',
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
  pageId?: string | null;
}

export interface UpdateBlockDto {
  type?: BlockType;
  content?: Record<string, any>;
}

export interface ReorderBlocksDto {
  blockIds: string[];
}

export const getBlocks = async (pageId?: string | null): Promise<Block[]> => {
  const params = pageId ? { pageId } : {};
  const response = await api.get<Block[]>('/blocks', { params });
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

export const reorderBlocks = async (blockIds: string[], pageId?: string | null): Promise<Block[]> => {
  const response = await api.put<Block[]>('/blocks/reorder/bulk', { blockIds, pageId: pageId || null });
  return response.data;
};

