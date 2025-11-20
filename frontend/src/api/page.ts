import api from './axios';
import { Block } from './blocks';

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

export const getPublicPage = async (
  username: string,
): Promise<PublicPageData> => {
  const response = await api.get<PublicPageData>(`/page/${username}`);
  return response.data;
};

