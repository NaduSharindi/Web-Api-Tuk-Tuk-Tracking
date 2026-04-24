import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format is "Bearer <token_string>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user from the database (excluding the password) and attach it to the request object
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Pass control to the next middleware or controller
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// @desc    Grant access to specific roles (e.g., ADMIN only)
export const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if the logged-in user's role is in the list of allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};