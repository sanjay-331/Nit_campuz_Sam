import { Request, Response } from 'express';
import { prisma } from '../db';
import PDFDocument from 'pdfkit';
import path from 'path';

export const generateNoDuesPdf = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = String(req.params.studentId);

        // Fetch student data
        const student = await prisma.user.findUnique({
            where: { id: studentId },
            include: {
                studentProfile: true
            }
        });

        const profile = student?.studentProfile as any;

        if (!student || !profile) {
            res.status(404).json({ message: 'Student profile not found' });
            return;
        }

        // Verify if a certificate has been issued
        const cert = await prisma.noDuesCertificate.findFirst({
            where: { studentId: studentId, status: 'Issued' }
        });

        if (!cert) {
            res.status(403).json({ message: 'No Dues Certificate has not been issued yet for this student.' });
            return;
        }

        // Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Ensure proper headers for PDF download
        res.setHeader('Content-disposition', `attachment; filename=No_Dues_Certificate_${profile.regNo || 'unknown'}.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF directly to the response
        doc.pipe(res);

        // --- Build PDF Content ---
        doc.fontSize(24).font('Helvetica-Bold').text('National Institute of Technology', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).font('Helvetica').text('No Dues Certificate', { align: 'center', underline: true });
        
        doc.moveDown(2);
        
        doc.fontSize(12).font('Helvetica').text(`This is to certify that `, { continued: true });
        doc.font('Helvetica-Bold').text(student.name, { continued: true });
        doc.font('Helvetica').text(` (Registration No: ${profile.regNo || 'Unknown'}), `);
        
        // Fetch department manually to bypass include type issues
        let deptName = 'Unknown';
        if (student.departmentId) {
            const dept = await prisma.department.findUnique({ where: { id: student.departmentId } });
            if (dept) deptName = dept.name;
        }

        doc.text(`studying in the Department of `, { continued: true });
        doc.font('Helvetica-Bold').text(deptName, { continued: true });
        doc.font('Helvetica').text(`, has successfully cleared all dues with the library, department, and accounts section.`);
        
        doc.moveDown(2);
        
        doc.text(`This certificate is issued on ${new Date(cert.issuedAt || new Date()).toLocaleDateString()}.`);

        doc.moveDown(4);

        // Signatures
        doc.text('_______________________', { align: 'left', continued: true });
        doc.text('_______________________', { align: 'right' });
        doc.text('Head of Department', { align: 'left', continued: true });
        doc.text('Principal         ', { align: 'right' });

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error while generating PDF' });
        }
    }
};
