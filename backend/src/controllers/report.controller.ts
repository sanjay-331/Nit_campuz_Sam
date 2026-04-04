import { Request, Response } from 'express';
import { prisma } from '../db';
import PDFDocument from 'pdfkit';
import { UserRole } from '@prisma/client';

export const generateNoDuesPdf = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = String(req.params.userId || req.params.studentId);

        // Fetch user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: true,
                department: true
            }
        });

        if (!user) {
            res.status(404).json({ message: 'User profile not found' });
            return;
        }

        // Verify if a certificate has been issued
        const cert = await prisma.noDuesCertificate.findFirst({
            where: { userId: userId, status: 'Issued' } as any
        });

        if (!cert) {
            res.status(403).json({ message: 'No Dues Certificate has not been issued yet for this user.' });
            return;
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        
        const fileName = (user as any).studentProfile?.regNo || user.name.replace(/\s+/g, '_');
        res.setHeader('Content-disposition', `attachment; filename=No_Dues_Certificate_${fileName}.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF directly to the response
        doc.pipe(res);

        // --- Build PDF Content ---
        doc.fontSize(24).font('Helvetica-Bold').text('National Institute of Technology', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).font('Helvetica').text('No Dues Certificate', { align: 'center', underline: true });
        
        doc.moveDown(2);
        
        const isStudent = user.role === UserRole.STUDENT;
        const profile = (user as any).studentProfile;

        doc.fontSize(12).font('Helvetica').text(`This is to certify that `, { continued: true });
        doc.font('Helvetica-Bold').text(user.name, { continued: true });
        
        if (isStudent && profile) {
            doc.font('Helvetica').text(` (Registration No: ${profile.regNo || 'Unknown'}), `);
            doc.text(`studying in the Department of `, { continued: true });
        } else {
            doc.font('Helvetica').text(` (${(user as any).designation || 'Staff Member'}), `);
            doc.text(`working in the Department of `, { continued: true });
        }
        
        doc.font('Helvetica-Bold').text(user.department?.name || 'Unknown', { continued: true });
        doc.font('Helvetica').text(`, has successfully cleared all dues with the library, department, and accounts section.`);
        
        doc.moveDown(2);
        
        doc.text(`This certificate is issued on ${new Date(cert.issuedAt || new Date()).toLocaleDateString()}.`);

        doc.moveDown(4);

        // Signatures
        doc.text('_______________________', { align: 'left', continued: true });
        doc.text('_______________________', { align: 'right' });
        doc.text('Head of Department', { align: 'left', continued: true });
        doc.text('Principal / Registrar', { align: 'right' });

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error while generating PDF' });
        }
    }
};
