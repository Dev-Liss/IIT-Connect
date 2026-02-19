/**
 * API Service for IIT Connect Backend
 * Handles all HTTP requests to the backend server
 */
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
        console.log("ℹ️ Profile sync finished:", error.message);
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
        console.log("ℹ️ Register API finished:", error.message);
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
        console.log("ℹ️ Login API finished:", error.message);
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
        console.log("ℹ️ Health Check finished:", error.message);
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
        console.log("ℹ️ Email check finished:", error.message);
        throw error;
    }
};


/**
 * Sync Google User to Backend
 * Link Google account to existing user or check if signup needed
 * @param {string} email - Google email
 * @param {string} clerkId - Clerk User ID
 * @param {string} username - User name from Google
 * @returns {Promise<Object>} API response
 */
export const syncGoogleUser = async (email, clerkId, username) => {
    try {
        console.log("📤 Syncing Google user:", email);
        const response = await fetch(`${API_BASE_URL}/auth/sync-google-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, clerkId, username }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Check if it's the specific "requires signup" 404
            if (response.status === 404 && data.requiresSignup) {
                const error = new Error(data.message);
                error.requiresSignup = true;
                throw error;
            }
            throw new Error(data.message || "Google sync failed");
        }

        return data;
    } catch (error) {
        console.log("ℹ️ Google sync finished:", error.message);
        throw error;
    }
};

/**
 * Validate Alumni credentials against backend JSON database
 * @param {string} nationalId - Alumni National ID
 * @param {string} iitId - Alumni Past IIT ID
 * @returns {Promise<Object>} API response
 */
export const validateAlumni = async (nationalId, iitId) => {
    try {
        console.log("🔍 Validating alumni credentials...");
        const response = await fetch(`${API_BASE_URL}/auth/validate-alumni`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nationalId, iitId }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Validation failed");
        }

        return data;
    } catch (error) {
        console.log("ℹ️ Alumni validation attempt finished:", error.message);
        throw error;
    }
};
