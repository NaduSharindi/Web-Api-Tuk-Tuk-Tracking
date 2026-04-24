import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { username, password, role, stationId } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Create user (password hashing is handled by the pre-save hook in User model)
        const user = await User.create({
            username,
            password,
            role,
            stationId: role === 'STATION_OFFICER' ? stationId : undefined
        });

        // 3. Generate Token and respond
        const token = generateToken(user._id, user.role);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user._id, username: user.username, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error during registration', error: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 2. Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Generate Token and respond
        const token = generateToken(user._id, user.role);
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error during login', error: error.message });
    }
};