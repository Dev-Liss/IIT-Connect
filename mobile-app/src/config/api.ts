/**
 * ====================================
 * API CONFIGURATION
 * ====================================
 * IMPORTANT FOR TEAM MEMBERS:
 *
 * 1. Find your laptop's IP address:
 *    - Windows: Open CMD and run `ipconfig` (look for IPv4 Address)
 *    - Mac/Linux: Open Terminal and run `ifconfig` or `ip addr`
 *
 * 2. Replace the IP below with YOUR laptop's IP address
 *
 * 3. Make sure your phone and laptop are on the SAME WiFi network
 *
 * Example: If your IP is 192.168.1.100, set:
 * const LAPTOP_IP = "192.168.1.100";
 */

// ⚠️ CHANGE THIS TO YOUR LAPTOP'S IP ADDRESS!
const LAPTOP_IP = "192.168.8.109";

// Backend port (should match PORT in backend/.env)
const PORT = "5000";

// Full API base URL
export const API_BASE_URL = `http://${LAPTOP_IP}:${PORT}/api`;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
};

// Events endpoints
export const EVENTS_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/events`,
  GET_ONE: (id: string) => `${API_BASE_URL}/events/${id}`,
  CREATE: `${API_BASE_URL}/events`,
  UPDATE: (id: string) => `${API_BASE_URL}/events/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/events/${id}`,
};

// Announcements endpoints
export const ANNOUNCEMENTS_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/announcements`,
  GET_ONE: (id: string) => `${API_BASE_URL}/announcements/${id}`,
  CREATE: `${API_BASE_URL}/announcements`,
  UPDATE: (id: string) => `${API_BASE_URL}/announcements/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/announcements/${id}`,
};

// Reports endpoints (anonymous)
export const REPORTS_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/reports`,
  GET_ONE: (id: string) => `${API_BASE_URL}/reports/${id}`,
  CREATE: `${API_BASE_URL}/reports`,
  UPDATE: (id: string) => `${API_BASE_URL}/reports/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/reports/${id}`,
};

// Health check endpoint (for testing connection)
export const HEALTH_CHECK_URL = `${API_BASE_URL}/health`;

export default {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  EVENTS_ENDPOINTS,
  ANNOUNCEMENTS_ENDPOINTS,
  REPORTS_ENDPOINTS,
  HEALTH_CHECK_URL,
  LAPTOP_IP,
  PORT,
};
