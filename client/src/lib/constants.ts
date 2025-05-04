// API Endpoints
export const API_ENDPOINTS = {
  PERIODS: '/api/periods',
  EVENTS: '/api/events',
  HISTORICAL_FIGURES: '/api/historical-figures',
  EVENT_TYPES: '/api/event-types',
  EVENT_TO_EVENT_TYPE: '/api/event-to-event-type',
  HISTORICAL_SITES: '/api/historical-sites',
  SEARCH: '/api/search',
};

// Vietnamese history periods - these match the database seeds
export const HISTORY_PERIODS = {
  PREHISTORIC: 'prehistoric',
  ANCIENT: 'ancient',
  AU_LAC: 'au-lac',
  CHINESE_DOMINATION: 'chinese-domination',
  NGO_DINH: 'ngo-dinh',
  LY: 'ly',
  TRAN: 'tran',
  HO_AND_MING: 'ho-and-ming',
  LE: 'le',
  TAY_SON: 'tay-son',
  NGUYEN: 'nguyen',
  FRENCH: 'french',
  MODERN: 'modern',
};

// Material Icons mapped to periods
export const PERIOD_ICONS = {
  [HISTORY_PERIODS.PREHISTORIC]: 'history',
  [HISTORY_PERIODS.ANCIENT]: 'account_balance',
  [HISTORY_PERIODS.AU_LAC]: 'public',
  [HISTORY_PERIODS.CHINESE_DOMINATION]: 'gavel',
  [HISTORY_PERIODS.NGO_DINH]: 'architecture',
  [HISTORY_PERIODS.LY]: 'castle',
  [HISTORY_PERIODS.TRAN]: 'military_tech',
  [HISTORY_PERIODS.HO_AND_MING]: 'security',
  [HISTORY_PERIODS.LE]: 'psychology',
  [HISTORY_PERIODS.TAY_SON]: 'local_fire_department',
  [HISTORY_PERIODS.NGUYEN]: 'stars',
  [HISTORY_PERIODS.FRENCH]: 'flag',
  [HISTORY_PERIODS.MODERN]: 'brightness_7',
};


// Image placeholder - used when no image is available
export const DEFAULT_IMAGE = 'https://via.placeholder.com/400x250?text=Lịch+Sử+Việt+Nam';
