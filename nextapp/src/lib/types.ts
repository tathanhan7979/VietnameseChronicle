// Period data types
export interface PeriodData {
  id: number;
  name: string;
  slug: string;
  timeframe: string;
  description: string;
  icon: string;
  is_show?: boolean;
  sort_order?: number;
}

// Event types
export interface EventType {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

// Event data
export interface EventData {
  id: number;
  periodId: number;
  title: string;
  description: string;
  detailedDescription?: string;
  year: string;
  imageUrl?: string;
  eventTypes?: EventType[];
  slug?: string;
}

// Achievement data
export interface Achievement {
  id: string;
  title: string;
  eventId?: number; // Liên kết với event (nếu có)
  year?: string;
}

// Historical figure data
export interface HistoricalFigure {
  id: number;
  name: string;
  periodId: number; // Liên kết trực tiếp với bảng periods
  periodText?: string; // Để tương thích ngược - sẽ bỏ dần
  lifespan: string;
  description: string;
  detailedDescription?: string;
  imageUrl: string;
  achievements?: Achievement[];
  slug?: string;
}

// Historical site data
export interface HistoricalSite {
  id: number;
  name: string;
  location: string;
  periodId?: number;
  description: string;
  detailedDescription?: string;
  imageUrl?: string;
  mapUrl?: string;
  address?: string;
  yearBuilt?: string;
  relatedEventId?: number;
  slug?: string;
}

// Search data
export interface SearchResult {
  id: string;
  type: 'period' | 'event' | 'figure' | 'site';
  title: string;
  subtitle: string;
  link: string;
  icon: string;
}

// Form data
export interface SearchFormData {
  term: string;
  periodFilter?: string;
  eventTypeFilter?: string;
}

export interface NewsletterFormData {
  email: string;
}

export interface FeedbackFormData {
  name: string;
  email: string;
  message: string;
  type: 'bug' | 'feature' | 'content' | 'other';
}

// API response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// User data
export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role: 'admin' | 'editor' | 'user';
}

// Settings data
export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
}