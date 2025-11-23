export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'file'
  | 'phone';

export interface RegistrationQuestion {
  id: string;
  label: string;
  required: boolean;
  type: QuestionType;
  helpText?: string;
}

export interface Ticket {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity?: number | null;
}

export interface Discount {
  id: string;
  name: string;
  type: 'percent' | 'fixed';
  value: number;
  description?: string;
}

export interface PublicationSettings {
  visibility: 'public' | 'link' | 'hidden';
  ageRestriction: string;
}

export interface EventDescriptionSettings {
  title: string;
  slug: string;
  description: string;
}

export interface RegistrationSettings {
  introText: string;
  questions: RegistrationQuestion[];
}

export interface ParticipationSettings {
  tickets: Ticket[];
  discounts: Discount[];
  summarizeDiscounts: boolean;
}

export interface EventCreationState {
  description: EventDescriptionSettings;
  registration: RegistrationSettings;
  participation: ParticipationSettings;
  publication: PublicationSettings;
}


