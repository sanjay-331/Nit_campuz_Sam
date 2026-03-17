import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/chat
// Protected: user must be logged in (sends their JWT)
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
        res.status(400).json({ message: 'A "message" string is required in the request body.' });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(503).json({ message: 'AI service is not configured on the server.' });
        return;
    }

    const role = req.user?.role;

    // Build the system instruction based on user's role (same logic as before, but now on the server)
    const buildSystemInstruction = (userRole: string | undefined): string => {
        const base = 'You are an AI assistant for the NIT Campuz LMS platform. ';
        const context = `Current User Role: ${userRole}. `;
        switch (userRole) {
            case 'ADMIN':
                return base + context + "You help admins manage users, departments, and promote classes. Explain that user management is in the 'Users' tab, and Promoting classes is in the 'Promote' tab.";
            case 'PRINCIPAL':
                return base + context + "You help the Principal monitor college performance. Mention the 'Verify Results' section for final mark approvals after HOD verification, and 'Reports' for analytics.";
            case 'HOD':
                return base + context + "You help the HOD manage their department. Mention the 'Verify Results' section for approving marks from the Exam Cell, and 'Staff' management.";
            case 'STAFF':
                return base + context + "You help teachers manage students. Mark entry is in 'Marks', and Attendance is in the 'Attendance' tab. Mention that marks go through Exam Cell, HOD, and Principal before publication.";
            case 'STUDENT':
                return base + context + "You are a study buddy for the student. Help them find 'Grades', 'Attendance', and 'Documents'. If grades aren't showing, explain they might be pending publication by the Exam Cell.";
            case 'EXAM_CELL':
                return base + context + "You help the Exam Cell with schedules and results. Mention the 'Results' tab where they can verify Staff marks and Publish the final results after Principal approval.";
            default:
                return base + 'You are a helpful assistant for NIT Campuz.';
        }
    };

    try {
        // Dynamically import the SDK so the backend loads it only when needed
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: buildSystemInstruction(role),
        });

        // Sanitise and rebuild the chat history sent from the frontend
        const cleanHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
        if (Array.isArray(history)) {
            for (const entry of history) {
                if (entry.role && entry.text) {
                    const mappedRole = entry.role === 'user' ? 'user' : 'model';
                    // Enforce alternating turns required by Gemini
                    if (cleanHistory.length === 0 && mappedRole === 'model') continue;
                    if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === mappedRole) continue;
                    cleanHistory.push({ role: mappedRole, parts: [{ text: entry.text }] });
                }
            }
        }

        const chat = model.startChat({ history: cleanHistory });
        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        res.status(200).json({ reply });
    } catch (error: any) {
        console.error('[Chat Route Error]', error?.message || error);
        res.status(500).json({ message: `AI service error: ${error?.message || 'Unknown error'}` });
    }
});

export default router;
