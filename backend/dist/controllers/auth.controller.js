"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_simple_1 = __importDefault(require("jwt-simple")); // We'll install this shortly
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                department: true,
                studentProfile: true,
                alumniProfile: true,
            }
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Base permissions map based on frontend role expectations
        const rolePermissions = {
            'ADMIN': ['users:manage', 'users:view', 'departments:manage', 'departments:view', 'logs:view', 'system:configure', 'alumni:manage', 'reports:generate', 'students:promote'],
            'PRINCIPAL': ['users:view', 'departments:view', 'reports:generate'],
            'HOD': ['users:view', 'students:promote'],
            'STAFF': [],
            'STUDENT': [],
            'EXAM_CELL': ['users:view', 'reports:generate']
        };
        // Don't send the password hash back
        const { password: _, studentProfile, alumniProfile, ...userWithoutPassword } = user;
        const profileData = studentProfile || alumniProfile || {};
        // Attach dynamically resolved permissions
        const userWithPermissions = {
            ...userWithoutPassword,
            ...profileData,
            permissions: rolePermissions[user.role] || []
        };
        // Create JWT Token
        const payload = {
            sub: user.id,
            role: user.role,
            iat: Date.now(),
        };
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt_simple_1.default.encode(payload, secret);
        res.json({
            token,
            user: userWithPermissions
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
