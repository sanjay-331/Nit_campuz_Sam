import { Request, Response } from 'express';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';

export const getAllOnDutyApplications = async (req: Request, res: Response): Promise<void> => {
    try {
        const applications = await prisma.onDutyApplication.findMany();
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const applyForOD = async (req: Request, res: Response): Promise<void> => {
    try {
        const { applicantId, reason, fromDate, toDate, type } = req.body;
        const applicant = await prisma.user.findUnique({ where: { id: applicantId } });

        if (!applicant) {
            res.status(404).json({ message: 'Applicant not found' });
            return;
        }

        let initialStatus = 'Pending Advisor';
        if (applicant.role === UserRole.STAFF) {
            initialStatus = 'Pending HOD';
        } else if (applicant.role === UserRole.HOD) {
            initialStatus = 'Pending Principal';
        }

        const newApplication = await prisma.onDutyApplication.create({
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
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const processODApplication = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { decision } = req.body;
        // Assume req.user comes from auth middleware
        const currentUser = (req as any).user; 

        if (!currentUser) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const app = await prisma.onDutyApplication.findUnique({ where: { id } });
        if (!app) {
            res.status(404).json({ message: 'Application not found' });
            return;
        }
        
        const applicant = await prisma.user.findUnique({ where: { id: app.applicantId } });

        let updateData: any = {};

        if (decision === 'reject') {
            updateData.status = 'Rejected';
            updateData.rejectedById = currentUser.id;
        } else if (decision === 'approve') {
            if (app.status === 'Pending Advisor' && currentUser.role === UserRole.STAFF) {
                updateData.status = 'Pending HOD';
                updateData.advisorApprovalId = currentUser.id;
            } else if (app.status === 'Pending HOD' && currentUser.role === UserRole.HOD) {
                updateData.hodApprovalId = currentUser.id;
                if (applicant?.role === UserRole.STAFF) {
                    updateData.status = 'Approved';
                } else {
                    updateData.status = 'Pending Principal';
                }
            } else if (app.status === 'Pending Principal' && currentUser.role === UserRole.PRINCIPAL) {
                updateData.status = 'Approved';
                updateData.principalApprovalId = currentUser.id;
            } else {
                res.status(403).json({ message: 'Not authorized to approve at this stage' });
                return;
            }
        }

        const updatedApp = await prisma.onDutyApplication.update({
            where: { id },
            data: updateData
        });

        res.json(updatedApp);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateODApplication = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const updates = req.body;
        
        if (updates.fromDate) updates.fromDate = new Date(updates.fromDate);
        if (updates.toDate) updates.toDate = new Date(updates.toDate);

        const updatedApp = await prisma.onDutyApplication.update({
            where: { id },
            data: updates
        });
        
        res.json(updatedApp);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- DUES Endpoints ---

export const getDuesAndCertificates = async (req: Request, res: Response): Promise<void> => {
    try {
        const dues = await prisma.dues.findMany();
        const certificates = await prisma.noDuesCertificate.findMany();
        // Since frontend mock just held certificates, returning both or treating separately.
        // The mock actually didn't store dues globally, dues were embedded on User objects!
        // But for certificates, frontend stores NO_DUES_CERTIFICATES.
        res.json({ certificates, dues });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateDuesStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, dueType, status } = req.body;
        
        // Ensure student exists
        const student = await prisma.user.findUnique({ where: { id: studentId } });
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }

        const updateData: any = {};
        updateData[dueType] = status;

        const updatedDues = await prisma.dues.upsert({
            where: { studentId },
            update: updateData,
            create: {
                studentId,
                ...updateData
            }
        });

        res.json(updatedDues);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const issueNoDuesCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.body;

        const dues = await prisma.dues.findUnique({ where: { studentId } });
        
        if (!dues || !dues.library || !dues.department || !dues.accounts) {
            res.status(400).json({ message: 'All dues must be cleared first.' });
            return;
        }

        const existingCert = await prisma.noDuesCertificate.findFirst({ where: { studentId } });
        let cert;

        if (existingCert) {
            cert = await prisma.noDuesCertificate.update({
                where: { id: existingCert.id },
                data: { status: 'Issued', issuedAt: new Date() }
            });
        } else {
            cert = await prisma.noDuesCertificate.create({
                data: {
                    studentId,
                    status: 'Issued',
                    issuedAt: new Date()
                }
            });
        }

        res.json(cert);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
