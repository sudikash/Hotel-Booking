const jwt = require('jsonwebtoken');
require('dotenv').config();

const getTokenFromRequest = (req) => {
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};

const optionalAuth = (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE || "default_jwt_secret");
        if (decoded.role !== 'user' && decoded.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden access." });
        }
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
    }
};

const authAdmin = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Please log in to access this resource." });
        }

        const decoded = jwt.verify(token, process.env.JWT_PRIVATE || "default_jwt_secret");

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden. Admin privilege required." });
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }
        return res.status(401).json({ message: "Invalid or expired token. Unauthorized access." });
    }
};

const authUser = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const decoded = jwt.verify(token, process.env.JWT_PRIVATE || "default_jwt_secret");

        if (decoded.role !== 'user' && decoded.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden access." });
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }
        return res.status(401).json({ message: "Invalid token. Please log in again." });
    }
};

module.exports = { authAdmin, authUser, optionalAuth };
