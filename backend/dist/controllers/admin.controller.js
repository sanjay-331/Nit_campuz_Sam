"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueNoDuesCertificate = exports.updateDuesStatus = exports.getDuesAndCertificates = exports.updateODApplication = exports.processODApplication = exports.applyForOD = exports.getAllOnDutyApplications = void 0;
const db_1 = require("../db");
const client_1 = require("@prisma/client");
const getAllOnDutyApplications = async (req, res) => {
    try {
        const applications = await db_1.prisma.onDutyApplication.findMany();
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllOnDutyApplications = getAllOnDutyApplications;
const applyForOD = async (req, res) => {
    try {
        const { applicantId, reason, fromDate, toDate, type } = req.body;
        const applicant = await db_1.prisma.user.findUnique({ where: { id: applicantId } });
        if (!applicant) {
            res.status(404).json({ message: 'Applicant not found' });
            return;
        }
        let initialStatus = 'Pending Advisor';
        if (applicant.role === client_1.UserRole.STAFF) {
            initialStatus = 'Pending HOD';
        }
        else if (applicant.role === client_1.UserRole.HOD) {
            initialStatus = 'Pending Principal';
        }
        const newApplication = await db_1.prisma.onDutyApplication.create({
            data: {
                applicantId,
                reason,
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
                type,
                status: initialStatus
            }
        });
        res.json(newApplication);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.applyForOD = applyForOD;
const processODApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision } = req.body;
        // Assume req.user comes from auth middleware
        const currentUser = req.user;
        if (!currentUser) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const app = await db_1.prisma.onDutyApplication.findUnique({ where: { id } });
        if (!app) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }
        const applicant = await db_1.prisma.user.findUnique({ where: { id: app.applicantId } });
        let updateData = {};
        if (decision === 'reject') {
            updateData.status = 'Rejected';
            updateData.rejectedById = currentUser.id;
        }
        else if (decision === 'approve') {
            if (app.status === 'Pending Advisor' && currentUser.role === client_1.UserRole.STAFF) {
                updateData.status = 'Pending HOD';
                updateData.advisorApprovalId = currentUser.id;
            }
            else if (app.status === 'Pending HOD' && currentUser.role === client_1.UserRole.HOD) {
                updateData.hodApprovalId = currentUser.id;
                if (applicant?.role === client_1.UserRole.STAFF) {
                    updateData.status = 'Approved';
                }
                else {
                    updateData.status = 'Pending Principal';
                }
            }
            else if (app.status === 'Pending Principal' && currentUser.role === client_1.UserRole.PRINCIPAL) {
                updateData.status = 'Approved';
                updateData.principalApprovalId = currentUser.id;
            }
            else {
                res.status(403).json({ message: 'Not authorized to approve at this stage' });
                return;
            }
        }
        const updatedApp = await db_1.prisma.onDutyApplication.update({
            where: { id },
            data: updateData
        });
        res.json(updatedApp);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.processODApplication = processODApplication;
const updateODApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (updates.fromDate)
            updates.fromDate = new Date(updates.fromDate);
        if (updates.toDate)
            updates.toDate = new Date(updates.toDate);
        const updatedApp = await db_1.prisma.onDutyApplication.update({
            where: { id },
            data: updates
        });
        res.json(updatedApp);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateODApplication = updateODApplication;
// --- DUES Endpoints ---
const getDuesAndCertificates = async (req, res) => {
    try {
        const dues = await db_1.prisma.dues.findMany();
        const certificates = await db_1.prisma.noDuesCertificate.findMany();
        // Since frontend mock just held certificates, returning both or treating separately.
        // The mock actually didn't store dues globally, dues were embedded on User objects!
        // But for certificates, frontend stores NO_DUES_CERTIFICATES.
        res.json({ certificates, dues });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getDuesAndCertificates = getDuesAndCertificates;
const updateDuesStatus = async (req, res) => {
    try {
        const { studentId, dueType, status } = req.body;
        // Ensure student exists
        const student = await db_1.prisma.user.findUnique({ where: { id: studentId } });
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        const updateData = {};
        updateData[dueType] = status;
        const updatedDues = await db_1.prisma.dues.upsert({
            where: { studentId },
            update: updateData,
            create: {
                studentId,
                ...updateData
            }
        });
        res.json(updatedDues);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateDuesStatus = updateDuesStatus;
const issueNoDuesCertificate = async (req, res) => {
    try {
        const { studentId } = req.body;
        const dues = await db_1.prisma.dues.findUnique({ where: { studentId } });
        if (!dues || !dues.library || !dues.department || !dues.accounts) {
            res.status(400).json({ message: 'All dues must be cleared first.' });
            return;
        }
        const existingCert = await db_1.prisma.noDuesCertificate.findFirst({ where: { studentId } });
        let cert;
        if (existingCert) {
            cert = await db_1.prisma.noDuesCertificate.update({
                where: { id: existingCert.id },
                data: { status: 'Issued', issuedAt: new Date() }
            });
        }
        else {
            cert = await db_1.prisma.noDuesCertificate.create({
                data: {
                    studentId,
                    status: 'Issued',
                    issuedAt: new Date()
                }
            });
        }
        res.json(cert);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.issueNoDuesCertificate = issueNoDuesCertificate;
