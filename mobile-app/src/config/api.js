/**
 * ====================================
 * API CONFIGURATION
 * ====================================
 * IMPORTANT FOR TEAM MEMBERS:
 *
 * Update EXPO_PUBLIC_LAPTOP_IP in mobile-app/.env when your IP changes.
 * Make sure your phone and laptop are on the SAME WiFi network.
 */

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 15000;

// ==========================================
// API & SOCKET URLS (Auto-switching)
// ==========================================
const LAPTOP_IP = process.env.EXPO_PUBLIC_LAPTOP_IP;
const PORT = "5000";

const LOCAL_SOCKET_URL = `http://${LAPTOP_IP}:${PORT}`;
const PROD_SOCKET_URL = "https://iit-connect.onrender.com";

export const SOCKET_URL = __DEV__ ? LOCAL_SOCKET_URL : PROD_SOCKET_URL;
export const API_BASE_URL = `${SOCKET_URL}/api`;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  GET_USERS: `${API_BASE_URL}/auth/users`,
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
  GET_BY_ID: (id) => `${API_BASE_URL}/reports/${id}`,
  BATCH: `${API_BASE_URL}/reports/batch`,
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

// Content Report endpoints
export const CONTENT_REPORT_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/content-reports`,
  GET_ALL: `${API_BASE_URL}/content-reports`,
  DISMISS: (id) => `${API_BASE_URL}/content-reports/${id}/dismiss`,
  REMOVE_CONTENT: (id) =>
    `${API_BASE_URL}/content-reports/${id}/remove-content`,
};

// Conversation endpoints
export const CONVERSATION_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/conversations`,
  GET_ONE: (id) => `${API_BASE_URL}/conversations/${id}`,
  CREATE_DIRECT: `${API_BASE_URL}/conversations/direct`,
  CREATE_GROUP: `${API_BASE_URL}/conversations/group`,
  ADD_PARTICIPANT: (id) => `${API_BASE_URL}/conversations/${id}/participants`,
  REMOVE_PARTICIPANT: (id, userId) =>
    `${API_BASE_URL}/conversations/${id}/participants/${userId}`,
};

// Message endpoints
export const MESSAGE_ENDPOINTS = {
  GET_MESSAGES: (conversationId) =>
    `${API_BASE_URL}/messages/${conversationId}`,
  SEND_MESSAGE: (conversationId) =>
    `${API_BASE_URL}/messages/${conversationId}`,
  MARK_READ: (messageId) => `${API_BASE_URL}/messages/${messageId}/read`,
  SEARCH: (conversationId) =>
    `${API_BASE_URL}/messages/${conversationId}/search`,
};

// Upload endpoints
export const UPLOAD_ENDPOINTS = {
  UPLOAD_MEDIA: `${API_BASE_URL}/upload/media`,
  UPLOAD_MULTIPLE: `${API_BASE_URL}/upload/multiple`,
  DELETE_FILE: (publicId) =>
    `${API_BASE_URL}/upload/${encodeURIComponent(publicId)}`,
};

// Health check endpoint (for testing connection)
export const HEALTH_CHECK_URL = `${API_BASE_URL}/health`;

export default {
  API_BASE_URL,
  SOCKET_URL,
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
  CONTENT_REPORT_ENDPOINTS,
  CONVERSATION_ENDPOINTS,
  MESSAGE_ENDPOINTS,
  UPLOAD_ENDPOINTS,
  HEALTH_CHECK_URL,
};
