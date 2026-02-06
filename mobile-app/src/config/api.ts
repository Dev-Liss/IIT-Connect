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
  GET_BY_ID: (id: string) => `${API_BASE_URL}/posts/${id}`,
};

// Story endpoints
export const STORY_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/stories`,
  GET_ALL: `${API_BASE_URL}/stories`,
  MARK_VIEWED: (id: string) => `${API_BASE_URL}/stories/${id}/view`,
};

// Health check endpoint (for testing connection)
export const HEALTH_CHECK_URL = `${API_BASE_URL}/health`;

export default {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  POST_ENDPOINTS,
  STORY_ENDPOINTS,
  HEALTH_CHECK_URL,
  LAPTOP_IP,
  PORT,
};
