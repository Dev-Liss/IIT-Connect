/**
 * Clerk Authentication Middleware
 * Validates Clerk session tokens for protected routes
 */

const { clerkClient } = require('@clerk/clerk-sdk-node');

/**
 * Middleware to verify Clerk JWT token
 * Attaches user info to req.auth if valid
 */
const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        // Verify the Clerk session token
        const session = await clerkClient.sessions.verifySession(token);

        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session',
            });
        }

        // Attach user ID to request
        req.auth = {
            userId: session.userId,
            sessionId: session.id,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
        });
    }
};

module.exports = { requireAuth };
