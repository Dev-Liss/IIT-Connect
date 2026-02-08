/**
 * API Service for IIT Connect Backend
 * Handles all HTTP requests to the backend server
 */

// Backend server URL
// ⚠️ ACTION REQUIRED: Change '192.168.1.10' below to your computer's actual local IP address!
// You can find your IP by running 'ipconfig' in your terminal.
const API_BASE_URL = "http://192.168.1.74:5000/api";

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Full name (firstName + lastName)
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string} userData.studentId - Student ID or employee ID
 * @param {string} userData.role - User role (student, lecture, alumni)
 * @returns {Promise<Object>} API response
 */
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            // Create error with proper message
            const error = new Error(data.message || "Registration failed");
            // Add emailExists flag if present
            if (data.emailExists) {
                error.emailExists = true;
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Register API Error:", error);
        throw error;
    }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} API response with user data
 */
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        return data;
    } catch (error) {
        console.error("Login API Error:", error);
        throw error;
    }
};

/**
 * Health check - Test if backend is reachable
 * @returns {Promise<Object>} API response
 */
export const checkHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL.replace("/api", "")}/api/health`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Health Check Error:", error);
        throw error;
    }
};

/**
 * Check if email already exists in the database
 * @param {string} email - Email address to check
 * @returns {Promise<Object>} API response with exists flag
 */
export const checkEmailExists = async (email) => {
    try {
        console.log("📧 Checking email:", email);
        console.log("API URL:", `${API_BASE_URL}/auth/check-email`);

        const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        const data = await response.json();
        console.log("Response data:", data);

        if (!response.ok) {
            throw new Error(data.message || "Email check failed");
        }

        return data;
    } catch (error) {
        console.error("Check Email API Error:", error);
        console.error("Error stack:", error.stack);
        throw error;
    }
};
