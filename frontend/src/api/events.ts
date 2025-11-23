import api from './axios';

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  registrationForm?: unknown | null;
  tickets?: unknown | null;
  discounts?: unknown | null;
  publicationSettings?: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  slug: string;
  description?: string;
  registrationForm?: unknown;
  tickets?: unknown;
  discounts?: unknown;
  publicationSettings?: unknown;
}

export interface UpdateEventDto {
  title?: string;
  slug?: string;
  description?: string;
  registrationForm?: unknown;
  tickets?: unknown;
  discounts?: unknown;
  publicationSettings?: unknown;
}

export const getEvents = async (): Promise<Event[]> => {
  const response = await api.get<Event[]>('/events');
  return response.data;
};

export const getEvent = async (id: string): Promise<Event> => {
  const response = await api.get<Event>(`/events/${id}`);
  return response.data;
};

export const createEvent = async (data: CreateEventDto): Promise<Event> => {
  const response = await api.post<Event>('/events', data);
  return response.data;
};

export const updateEvent = async (
  id: string,
  data: UpdateEventDto,
): Promise<Event> => {
  const response = await api.put<Event>(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};

