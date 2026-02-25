"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
exports.prisma = prisma;
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const academic_routes_1 = __importDefault(require("./routes/academic.routes"));
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
const mentoring_routes_1 = __importDefault(require("./routes/mentoring.routes"));
const tutoring_routes_1 = __importDefault(require("./routes/tutoring.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/academic', academic_routes_1.default);
app.use('/api/assignments', assignment_routes_1.default);
app.use('/api/mentoring', mentoring_routes_1.default);
app.use('/api/tutoring', tutoring_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Basic healthcheck route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NIT Campuz Backend is running.' });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
