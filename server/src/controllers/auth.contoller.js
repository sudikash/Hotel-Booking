const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const isSecure = process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const registerUser = async (req, res) => {
    try {
        const { userName, email, passWord } = req.body;

        const isUserExist = await userModel.findOne({ userName });

        if (isUserExist) {
            return res.status(409).json({
                message: "Username is already taken. Please choose another username."
            });
        }

        const hash = await bcrypt.hash(passWord, 10);

        const user = await userModel.create({
            userName,
            email,
            passWord: hash
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_PRIVATE || "default_jwt_secret",
            { expiresIn: '7d' }
        );

        res.cookie('token', token, COOKIE_OPTIONS);

        const userResponse = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
            role: user.role
        };

        res.status(201).json({
            message: "User registered successfully",
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('[Auth Error] Register:', error);
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.userName) {
                return res.status(409).json({ message: "Username is already taken. Please choose another username." });
            }
            if (error.keyPattern && error.keyPattern.email) {
                return res.status(409).json({ message: "Email is already registered." });
            }
            return res.status(409).json({ message: "User account details already exist." });
        }
        res.status(500).json({
            message: error.message || "Internal server error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { userName, email, passWord } = req.body;

        const queryConditions = [];
        if (userName) queryConditions.push({ userName });
        if (email) queryConditions.push({ email });

        if (queryConditions.length === 0) {
            return res.status(400).json({ message: "Username or email is required." });
        }

        const user = await userModel.findOne({ $or: queryConditions });

        if (!user) {
            return res.status(401).json({
                message: "User not found. Please check your credentials."
            });
        }

        const isValidPassword = await bcrypt.compare(passWord, user.passWord);

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid password. Please try again."
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_PRIVATE || "default_jwt_secret",
            { expiresIn: '7d' }
        );

        res.cookie("token", token, COOKIE_OPTIONS);

        const userResponse = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
            role: user.role
        };

        res.status(200).json({
            message: "Login successful",
            user: userResponse,
            isuserExist: userResponse, // maintain backward compatibility
            token
        });

    } catch (error) {
        console.error('[Auth Error] Login:', error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const logoutUser = async (req, res) => {
    res.clearCookie("token", COOKIE_OPTIONS);
    res.status(200).json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select('-passWord');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };
