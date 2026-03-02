import { Request, Response } from 'express';
import { prisma } from '../db';
import { getIO } from '../socket';

export const getAllAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignments = await prisma.assignment.findMany();
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, title, dueDate } = req.body;
    
    if (!courseId || !title || !dueDate) {
      res.status(400).json({ message: 'courseId, title, and dueDate are required' });
      return;
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        dueDate: new Date(dueDate),
      }
    });

    // Emit real-time notification
    try {
        const io = getIO();
        io.emit('notification', {
            type: 'Assignment',
            message: `New assignment posted: ${title}`,
            courseId: courseId
        });
    } catch (socketError) {
        console.error('Socket emission failed:', socketError);
    }

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await prisma.submission.findMany();
    // Rename id to match frontend if needed, or just let frontend use assignmentId & studentId
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignmentId = String(req.params.assignmentId);
    const { studentId, fileUrl, textSubmission, topic, remarks } = req.body;

    if (!studentId) {
      res.status(400).json({ message: 'studentId is required' });
      return;
    }

    // Check if submission exists
    const existing = await prisma.submission.findFirst({
        where: { assignmentId: String(assignmentId), studentId: String(studentId) }
    });

    let submission;
    if (existing) {
        submission = await prisma.submission.update({
            where: { id: existing.id },
            data: {
                fileUrl,
                textSubmission,
                topic,
                remarks,
                submittedAt: new Date(),
                status: 'Submitted'
            }
        });
    } else {
        submission = await prisma.submission.create({
            data: {
                assignmentId,
                studentId,
                fileUrl,
                textSubmission,
                topic,
                remarks,
                status: 'Submitted',
                submittedAt: new Date(),
            }
        });
    }

    res.json(submission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const gradeSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assignmentId, studentId, grade } = req.body;
  
      if (!assignmentId || !studentId || !grade) {
        res.status(400).json({ message: 'assignmentId, studentId, and grade are required' });
        return;
      }
  
      const existing = await prisma.submission.findFirst({
          where: { assignmentId: String(assignmentId), studentId: String(studentId) }
      });
  
      if (!existing) {
          res.status(404).json({ message: 'Submission not found' });
          return;
      }
  
      const submission = await prisma.submission.update({
          where: { id: existing.id },
          data: {
              grade,
              status: 'Graded'
          }
      });
  
      res.json(submission);
    } catch (error) {
      console.error('Error grading submission:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

export const bulkAssignTopics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId, assignments } = req.body;
        
        const results = [];
        for (const item of assignments) {
            const { studentId, topic, remarks } = item;
            
            // Find existing submission for any assignment in this course
            const assignment = await prisma.assignment.findFirst({ where: { courseId } });
            if (!assignment) continue;

            const existing = await prisma.submission.findFirst({
                where: { assignmentId: assignment.id, studentId }
            });

            if (existing) {
                const updated = await prisma.submission.update({
                    where: { id: existing.id },
                    data: { topic, remarks }
                });
                results.push(updated);
            } else {
                const created = await prisma.submission.create({
                    data: {
                        assignmentId: assignment.id,
                        studentId,
                        topic,
                        remarks,
                        status: 'Not Submitted'
                    }
                });
                results.push(created);
            }
        }

        res.json({ message: `Successfully assigned topics to ${results.length} students`, data: results });
    } catch (error) {
        console.error('Error bulk assigning topics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
