// API base URL
// Sử dụng URL tương đối cho API vì chúng ta đã cấu hình rewrites trong next.config.mjs
export const API_BASE_URL = '';

// API Endpoints
export const API_ENDPOINTS = {
  // Periods
  PERIODS: `${API_BASE_URL}/api/periods`,
  PERIOD_BY_SLUG: (slug: string) => `${API_BASE_URL}/api/periods/slug/${slug}`,
  
  // Events
  EVENTS: `${API_BASE_URL}/api/events`,
  EVENT_BY_ID: (id: number) => `${API_BASE_URL}/api/events/${id}`,
  EVENTS_BY_PERIOD: (periodId: number) => `${API_BASE_URL}/api/periods/${periodId}/events`,
  
  // Historical Figures
  HISTORICAL_FIGURES: `${API_BASE_URL}/api/historical-figures`,
  HISTORICAL_FIGURE_BY_ID: (id: number) => `${API_BASE_URL}/api/historical-figures/${id}`,
  HISTORICAL_FIGURES_BY_PERIOD: (periodId: number) => `${API_BASE_URL}/api/periods/${periodId}/historical-figures`,
  
  // Historical Sites
  HISTORICAL_SITES: `${API_BASE_URL}/api/historical-sites`,
  HISTORICAL_SITE_BY_ID: (id: number) => `${API_BASE_URL}/api/historical-sites/${id}`,
  HISTORICAL_SITES_BY_PERIOD: (periodId: number) => `${API_BASE_URL}/api/periods/${periodId}/historical-sites`,
  
  // Event Types
  EVENT_TYPES: `${API_BASE_URL}/api/event-types`,
  EVENT_TYPE_BY_ID: (id: number) => `${API_BASE_URL}/api/event-types/${id}`,
  EVENT_TO_EVENT_TYPE: `${API_BASE_URL}/api/event-to-event-type`,
  
  // Search
  SEARCH: `${API_BASE_URL}/api/search`,
  
  // Feedback
  FEEDBACK: `${API_BASE_URL}/api/feedback`,
  
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  CURRENT_USER: `${API_BASE_URL}/api/auth/user`,
  
  // Settings
  SETTINGS: `${API_BASE_URL}/api/settings`,
  SETTING_BY_KEY: (key: string) => `${API_BASE_URL}/api/settings/${key}`,
  
  // Upload
  UPLOAD: `${API_BASE_URL}/api/upload`,

  // Admin
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
};


// Image placeholder - used when no image is available
export const DEFAULT_IMAGE = 'https://lichsuviet.edu.vn/uploads/banner-image.png';
export const ERROR_IMAGE = 'https://lichsuviet.edu.vn/uploads/banner-image.png';
export const DEFAULT_SEO_IMAGE = 'https://lichsuviet.edu.vn/uploads/banner-image.png';
export const DEFAULT_AVATAR = 'https://lichsuviet.edu.vn/uploads/default-avatar.png';

// Application constants
export const SITE_NAME = 'Lịch Sử Việt Nam';
export const SITE_DESCRIPTION = 'Khám phá hành trình lịch sử Việt Nam từ thời kỳ Tiền sử đến hiện đại';
export const SITE_KEYWORDS = 'lịch sử Việt Nam, thời kỳ lịch sử, nhân vật lịch sử, di tích lịch sử, sự kiện lịch sử';

// Social media
export const FACEBOOK_APP_ID = '198066915623'; // App ID cho tính năng Facebook Comments
export const FACEBOOK_PAGE = 'https://facebook.com/lichsuviet.edu.vn';
export const YOUTUBE_CHANNEL = 'https://youtube.com/lichsuviet';

// Pagination
export const ITEMS_PER_PAGE = 12;
