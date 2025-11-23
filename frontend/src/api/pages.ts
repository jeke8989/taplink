import api from './axios';

export interface Page {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageStats {
  today: number;
  last7Days: number;
  last30Days: number;
}

export interface CreatePageDto {
  title: string;
  slug?: string | null;
  description?: string | null;
}

export interface UpdatePageDto {
  title?: string;
  slug?: string | null;
  description?: string | null;
}

export const getPages = async (): Promise<Page[]> => {
  const response = await api.get<Page[]>('/pages');
  return response.data;
};

export const getPage = async (id: string): Promise<Page> => {
  const response = await api.get<Page>(`/pages/${id}`);
  return response.data;
};

export const createPage = async (data: CreatePageDto): Promise<Page> => {
  const response = await api.post<Page>('/pages', data);
  return response.data;
};

export const updatePage = async (
  id: string,
  data: UpdatePageDto,
): Promise<Page> => {
  const response = await api.put<Page>(`/pages/${id}`, data);
  return response.data;
};

export const deletePage = async (id: string): Promise<void> => {
  await api.delete(`/pages/${id}`);
};

export const getPageStats = async (id: string): Promise<PageStats> => {
  const response = await api.get<PageStats>(`/pages/${id}/stats`);
  return response.data;
};

