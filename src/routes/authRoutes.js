import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route (No Auth Required)
router.post('/login', login);

// Protected routes (Requires a valid JWT token)
router.use(protect);

// Admin-only Registration (Requires Auth AND 'admin' role)
router.post('/register', authorize('admin'), register);

// General protected routes
router.get('/me', getMe);
router.post('/logout', logout);

export default router;