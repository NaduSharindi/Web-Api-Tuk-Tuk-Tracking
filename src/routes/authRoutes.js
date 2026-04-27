import express from 'express';
import { register, login, getUsers } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (Anyone can attempt to login or register)
router.post('/register', register);
router.post('/login', login);

// Protected routes (Must be logged in, AND must be an ADMIN)
router.get('/users', protect, authorize('ADMIN'), getUsers); // <-- NEW ROUTE

export default router;