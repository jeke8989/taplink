import api from './axios';
import type { Block } from './blocks';

export interface PublicPageData {
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  backgroundColor: string;
  fontColor: string;
  fontFamily: string;
  links: Array<{ title: string; url: string }>;
  blocks: Block[];
}

export interface PagePublicData {
  title: string;
  description: string | null;
  slug: string | null;
  blocks: Block[];
}

export const getPublicPage = async (
  username: string,
): Promise<PublicPageData> => {
  const response = await api.get<PublicPageData>(`/page/${username}`);
  return response.data;
};

export const getPageBySlug = async (
  pageSlug: string,
): Promise<PagePublicData> => {
  const response = await api.get<PagePublicData>(`/page/${pageSlug}`);
  return response.data;
};

