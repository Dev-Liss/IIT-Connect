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
const LAPTOP_IP = "192.168.100.165";

// Backend port (should match PORT in backend/.env)
const PORT = "5000";

// Full API base URL
export const API_BASE_URL = `http://${LAPTOP_IP}:${PORT}/api`;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
};

// Kuppi endpoints
export const KUPPI_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/kuppi`,
  MY_SESSIONS: `${API_BASE_URL}/kuppi/my-sessions`,
  CREATE: `${API_BASE_URL}/kuppi/create`,
  JOIN: (id: string) => `${API_BASE_URL}/kuppi/join/${id}`,
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
  RESOURCE_ENDPOINTS,
  HEALTH_CHECK_URL,
  LAPTOP_IP,
  PORT,
};
