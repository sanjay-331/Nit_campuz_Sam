"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const db_1 = require("../db");
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Missing Authorization header' });
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Malformed token' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt_simple_1.default.decode(token, secret);
        // Verify user exists in database
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.sub },
            select: { id: true, role: true }
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid session. User not found.' });
            return;
        }
        req.user = {
            id: user.id,
            role: user.role,
        };
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden. You do not have the required role.' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
