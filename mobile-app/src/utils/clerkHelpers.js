/**
 * Clerk Helper Utilities
 * Custom email validation for role-based restrictions
 */

/**
 * Validate email format matches the selected role
 * @param {string} email - Email address to validate
 * @param {string} role - User role (student, lecture, alumni)
 * @returns {Object} { valid: boolean, message: string }
 */
export const validateEmailForRole = (email, role) => {
    if (!email || !role) {
        return {
            valid: false,
            message: "Email and role are required",
        };
    }

    const emailLower = email.toLowerCase().trim();
    const emailUsername = emailLower.split("@")[0];
    const hasNumbers = /\d/.test(emailUsername);

    // Students and lecturers must use @iit.ac.lk domain
    if (role === "student" || role === "lecture") {
        if (!emailLower.endsWith("@iit.ac.lk")) {
            return {
                valid: false,
                message: "Students and Lecturers must use an @iit.ac.lk email address",
            };
        }
    }

    // Student email must contain numbers (e.g., han.20231234@iit.ac.lk)
    if (role === "student" && !hasNumbers) {
        return {
            valid: false,
            message: "This is a lecturer email format. Student emails must contain numbers (e.g., john.20231234@iit.ac.lk)",
        };
    }

    // Lecturer email must NOT contain numbers (e.g., salitha.p@iit.ac.lk)
    if (role === "lecture" && hasNumbers) {
        return {
            valid: false,
            message: "This is a student email format. Lecturer emails cannot contain numbers (e.g., john.d@iit.ac.lk)",
        };
    }

    // Alumni can use any email format
    return {
        valid: true,
        message: "Email is valid",
    };
};

/**
 * Validate email format is correct
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
