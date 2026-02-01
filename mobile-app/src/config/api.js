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
const LAPTOP_IP = "10.34.17.32";

// Backend port (should match PORT in backend/.env)
const PORT = "5000";

// Full API base URL
export const API_BASE_URL = `http://${LAPTOP_IP}:${PORT}/api`;

// Socket.io URL (same server, different purpose)
export const SOCKET_URL = `http://${LAPTOP_IP}:${PORT}`;

// Auth endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
};

// Conversation endpoints
export const CONVERSATION_ENDPOINTS = {
    GET_ALL: `${API_BASE_URL}/conversations`,
    GET_ONE: (id) => `${API_BASE_URL}/conversations/${id}`,
    CREATE_DIRECT: `${API_BASE_URL}/conversations/direct`,
    CREATE_GROUP: `${API_BASE_URL}/conversations/group`,
    ADD_PARTICIPANT: (id) => `${API_BASE_URL}/conversations/${id}/participants`,
    REMOVE_PARTICIPANT: (id, userId) => `${API_BASE_URL}/conversations/${id}/participants/${userId}`,
};

// Message endpoints
export const MESSAGE_ENDPOINTS = {
    GET_MESSAGES: (conversationId) => `${API_BASE_URL}/messages/${conversationId}`,
    SEND_MESSAGE: (conversationId) => `${API_BASE_URL}/messages/${conversationId}`,
    MARK_READ: (messageId) => `${API_BASE_URL}/messages/${messageId}/read`,
    SEARCH: (conversationId) => `${API_BASE_URL}/messages/${conversationId}/search`,
};

// Health check endpoint (for testing connection)
export const HEALTH_CHECK_URL = `${API_BASE_URL}/health`;

export default {
    API_BASE_URL,
    SOCKET_URL,
    AUTH_ENDPOINTS,
    CONVERSATION_ENDPOINTS,
    MESSAGE_ENDPOINTS,
    HEALTH_CHECK_URL,
    LAPTOP_IP,
    PORT,
};
