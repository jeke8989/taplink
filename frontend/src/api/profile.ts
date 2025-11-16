import api from './axios';

export interface Link {
  title: string;
  url: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  backgroundColor: string;
  fontColor: string;
  fontFamily: string;
  links: Link[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  backgroundColor?: string;
  fontColor?: string;
  fontFamily?: string;
  links?: Link[];
}

export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/profile/me');
  return response.data;
};

export const updateMyProfile = async (
  data: UpdateProfileDto,
): Promise<UserProfile> => {
  const response = await api.put<UserProfile>('/profile/me', data);
  return response.data;
};

