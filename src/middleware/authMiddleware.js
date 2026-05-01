import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Blacklist from '../models/Blacklist.js';

// @desc    Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
    let token;

    // Check if the header has the Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extract the token from the header
            token = req.headers.authorization.split(' ')[1];

            // 2. Check if token is blacklisted (Our secure logout feature!)
            const isBlacklisted = await Blacklist.findOne({ token });
            if (isBlacklisted) {
                return res.status(401).json({ message: 'Not authorized, token has been logged out/invalidated' });
            }

            // 3. VERIFY AND DECODE THE TOKEN (This is the line you were missing!)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user in the database
            req.user = await User.findById(decoded.id).select('-password');

            // 5. The Ghost Token Check
            if (!req.user) {
                return res.status(401).json({ message: 'Ghost Token: This user no longer exists in the database!' });
            }

            next(); // Everything is good, proceed to the controller!

        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed or expired' });
        }
    }

    // If no token was provided at all
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