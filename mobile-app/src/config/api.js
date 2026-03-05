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

// Events endpoints
export const EVENTS_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/events`,
  GET_ONE: (id) => `${API_BASE_URL}/events/${id}`,
  CREATE: `${API_BASE_URL}/events`,
  UPDATE: (id) => `${API_BASE_URL}/events/${id}`,
  DELETE: (id) => `${API_BASE_URL}/events/${id}`,
};

// Announcements endpoints
export const ANNOUNCEMENTS_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/announcements`,
  GET_ONE: (id) => `${API_BASE_URL}/announcements/${id}`,
  CREATE: `${API_BASE_URL}/announcements`,
  UPDATE: (id) => `${API_BASE_URL}/announcements/${id}`,
  DELETE: (id) => `${API_BASE_URL}/announcements/${id}`,
};

// Reports endpoints (anonymous)
export const REPORTS_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/reports`,
  GET_ONE: (id) => `${API_BASE_URL}/reports/${id}`,
  CREATE: `${API_BASE_URL}/reports`,
  UPDATE: (id) => `${API_BASE_URL}/reports/${id}`,
  DELETE: (id) => `${API_BASE_URL}/reports/${id}`,
};

// Report endpoints (Admin Dashboard for Lecturers)
export const REPORT_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/reports`,
  GET_ALL: `${API_BASE_URL}/reports`,
  GET_BY_ID: (id) => `${API_BASE_URL}/reports/${id}`,
  UPDATE_STATUS: (id) => `${API_BASE_URL}/reports/${id}/status`,
  ADD_RESPONSE: (id) => `${API_BASE_URL}/reports/${id}/response`,
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
  EVENTS_ENDPOINTS,
  ANNOUNCEMENTS_ENDPOINTS,
  REPORTS_ENDPOINTS,
  REPORT_ENDPOINTS,
  HEALTH_CHECK_URL,
  LAPTOP_IP,
  PORT,
};
