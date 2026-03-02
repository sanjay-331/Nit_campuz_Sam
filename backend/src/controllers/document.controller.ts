import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/auth.middleware';

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, fileUrl } = req.body;
        const studentId = req.user?.id;

        if (!studentId || !title || !fileUrl) {
            res.status(400).json({ message: 'Missing required fields: title, fileUrl' });
            return;
        }

        const document = await prisma.studentDocument.create({
            data: {
                studentId: String(studentId),
                title: String(title),
                fileUrl: String(fileUrl),
                status: 'Pending'
            }
        });

        res.status(201).json(document);
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Internal server error while uploading document' });
    }
};

export const getStudentDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const studentId = req.user?.id;

        if (!studentId) {
             res.status(401).json({ message: 'Unauthorized' });
             return;
        }

        const documents = await prisma.studentDocument.findMany({
            where: { studentId: String(studentId) },
            orderBy: { uploadedAt: 'desc' }
        });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching student documents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllPendingDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const documents = await prisma.studentDocument.findMany({
            where: { status: 'Pending' },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { uploadedAt: 'asc' }
        });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching all pending documents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const adminId = req.user?.id;
        const documentId = req.params.id;
        const { status, remarks } = req.body;

        if (!adminId || !documentId || !['Verified', 'Rejected'].includes(status)) {
            res.status(400).json({ message: 'Invalid verify payload' });
            return;
        }

        const updatedDoc = await prisma.studentDocument.update({
            where: { id: String(documentId) },
            data: {
                status: String(status),
                remarks: remarks ? String(remarks) : null,
                verifiedBy: String(adminId),
                verifiedAt: new Date()
            }
        });

        res.json(updatedDoc);
    } catch (error) {
        console.error('Error verifying document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
