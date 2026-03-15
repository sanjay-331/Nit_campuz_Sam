"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return db_1.prisma; } });
const socket_1 = require("./socket");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const academic_routes_1 = __importDefault(require("./routes/academic.routes"));
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
const mentoring_routes_1 = __importDefault(require("./routes/mentoring.routes"));
const tutoring_routes_1 = __importDefault(require("./routes/tutoring.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const library_routes_1 = __importDefault(require("./routes/library.routes"));
const error_1 = require("./middleware/error");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 8080;
// Initialize Socket.io
(0, socket_1.initSocket)(server);
// Request Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://nit-campuz.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:4000',
            'http://localhost:4001'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`CORS: Origin ${origin} not allowed`);
            // Instead of returning an error, we return true but the headers will 
            // naturally fail if we don't handle it. Actually, returning false 
            // is better for standard CORS behavior.
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json());
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/academic', academic_routes_1.default);
app.use('/api/assignments', assignment_routes_1.default);
app.use('/api/mentoring', mentoring_routes_1.default);
app.use('/api/tutoring', tutoring_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/library', library_routes_1.default);
// Basic healthcheck route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NIT Campuz Backend is running.' });
});
// Error handling middleware
app.use(error_1.errorHandler);
// Start the server
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
