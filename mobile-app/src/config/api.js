/**
 * ====================================
 * API CONFIGURATION
 * ====================================
 */

// Read from .env file - update EXPO_PUBLIC_LAPTOP_IP in .env when your IP changes
const LAPTOP_IP = process.env.EXPO_PUBLIC_LAPTOP_IP;

// Backend port (should match PORT in backend/.env)
const PORT = "5000";

// Full API base URL
export const API_BASE_URL = `http://${LAPTOP_IP}:${PORT}/api`;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
};

// Post endpoints (Phase 3)
export const POST_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/posts`,
  GET_ALL: `${API_BASE_URL}/posts`,
  GET_FEED: () => `${API_BASE_URL}/posts?mediaType=image`,
  GET_REELS: () => `${API_BASE_URL}/posts?mediaType=video`,
  GET_BY_ID: (id) => `${API_BASE_URL}/posts/${id}`,
  TOGGLE_LIKE: (id) => `${API_BASE_URL}/posts/${id}/like`,
  ADD_COMMENT: (id) => `${API_BASE_URL}/posts/${id}/comment`,
  GET_COMMENTS: (id) => `${API_BASE_URL}/posts/${id}/comments`,
};

// Story endpoints
export const STORY_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/stories`,
  GET_ALL: `${API_BASE_URL}/stories`,
  MARK_VIEWED: (id) => `${API_BASE_URL}/stories/${id}/view`,
};

// Timetable endpoints
export const TIMETABLE_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/timetable`,
  GET_BY_GROUP: (group) => `${API_BASE_URL}/timetable/${group}`,
};

// Kuppi endpoints
export const KUPPI_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/kuppi`,
  MY_SESSIONS: `${API_BASE_URL}/kuppi/my-sessions`,
  CREATE: `${API_BASE_URL}/kuppi/create`,
  JOIN: (id) => `${API_BASE_URL}/kuppi/join/${id}`,
};

// Resource endpoints
export const RESOURCE_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/resources/all`,
  UPLOAD: `${API_BASE_URL}/resources/upload`,
};

// Health check endpoint (for testing connection)
export const HEALTH_CHECK_URL = `${API_BASE_URL}/health`;

export default {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  POST_ENDPOINTS,
  STORY_ENDPOINTS,
  TIMETABLE_ENDPOINTS,
  KUPPI_ENDPOINTS,
  RESOURCE_ENDPOINTS,
  HEALTH_CHECK_URL,
  LAPTOP_IP,
  PORT,
};
