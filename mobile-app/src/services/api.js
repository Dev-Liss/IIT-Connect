/**
 * API Service for IIT Connect Backend
 * Handles all HTTP requests to the backend server
 */

// Backend server URL
// ⚠️ ACTION REQUIRED: Change '192.168.1.10' below to your computer's actual local IP address!
// You can find your IP by running 'ipconfig' in your terminal.
const API_BASE_URL = "http://192.168.1.74:5000/api";

/**
 * Sync user profile to MongoDB after Clerk authentication
 * @param {Object} profileData - User profile data
 * @param {string} profileData.clerkId - Clerk user ID
 * @param {string} profileData.email - Email address
 * @param {string} profileData.role - User role (student, lecture, alumni)
 * @param {string} profileData.username - Full name
 * @param {string} profileData.studentId - Student ID (optional)
 * @param {string} profileData.nationalId - National ID for alumni (optional)
 * @param {string} profileData.pastIitId - Past IIT ID for alumni (optional)
 * @returns {Promise<Object>} API response
 */
export const syncUserProfile = async (profileData) => {
    try {
        console.log("📤 Syncing profile to backend:", profileData);

        const response = await fetch(`${API_BASE_URL}/auth/sync-profile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Profile sync failed");
        }

        console.log("✅ Profile synced successfully");
        return data;
    } catch (error) {
        console.error("❌ Profile sync error:", error);
        throw error;
    }
};

/**
 * Register user (Legacy - kept for backwards compatibility)
 * @deprecated Use Clerk signup + syncUserProfile instead
 */
export const registerUser = async (userData) => {
    console.warn("⚠️ registerUser is deprecated. Use Clerk signup + syncUserProfile");
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
            const error = new Error(data.message || "Registration failed");
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
