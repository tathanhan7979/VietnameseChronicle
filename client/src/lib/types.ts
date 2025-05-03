// Types for the history data

export interface PeriodData {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  icon: string;
}

export interface EventData {
  id: number;
  periodId: number;
  title: string;
  description: string;
  year: string;
  imageUrl?: string;
  eventType?: string;
}

export interface HistoricalFigure {
  id: number;
  name: string;
  period: string;
  lifespan: string;
  description: string;
  imageUrl: string;
  achievements?: string[];
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
