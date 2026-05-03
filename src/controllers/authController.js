import User from '../models/User.js';
import Blacklist from '../models/Blacklist.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to generate JWT
// 🛠️ FIX: Now includes stationId, districtId, and provinceId in the token payload!
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            stationId: user.stationId,
            districtId: user.districtId,
            provinceId: user.provinceId
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Changed to 15m to match your coursework spec!
    );
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
            stationId: role === 'STATION_OFFICER' || role === 'station' ? stationId : undefined
        });

        // 3. Generate Token and respond
        const token = generateToken(user);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user._id, username: user.username, role: user.role, stationId: user.stationId }
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
        const token = generateToken(user);
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, role: user.role, stationId: user.stationId }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error during login', error: error.message });
    }
};

// @desc    Get a list of all registered users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('stationId', 'name districtId');

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Log user out / clear cookie / invalidate token
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            await Blacklist.create({ token });
        }

        res.status(200).json({ success: true, message: 'Successfully logged out and token invalidated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};