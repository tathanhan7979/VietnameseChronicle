// Types for the history data

export interface PeriodData {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  icon: string;
}

export interface EventType {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface EventData {
  id: number;
  periodId: number;
  title: string;
  description: string;
  detailedDescription?: string;
  year: string;
  imageUrl?: string;
  eventTypes?: EventType[];
}

export interface Achievement {
  id: string;
  title: string;
  eventId?: number; // Liên kết với event (nếu có)
  year?: string;
}

export interface HistoricalFigure {
  id: number;
  name: string;
  period: string;
  lifespan: string;
  description: string;
  detailedDescription?: string;
  imageUrl: string;
  achievements?: Achievement[];
}

export interface SearchResult {
  id: string;
  type: 'period' | 'event' | 'figure';
  title: string;
  subtitle: string;
  link: string;
  icon: string;
}

// Form types for search and newsletter
export interface SearchFormData {
  term: string;
  periodFilter?: string;
  eventTypeFilter?: string;
}

export interface NewsletterFormData {
  email: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
