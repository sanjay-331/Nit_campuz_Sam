# NIT Campuz - Multi-Role Learning Management System (LMS)

NIT Campuz is a comprehensive, modern Learning Management System designed for educational institutions. It features a role-based access control system, providing tailored dashboards and functionalities for Admins, Principals, HODs, Staff, Students, and Exam Cell personnel. The application is enhanced with an integrated AI Assistant to streamline tasks and provide contextual support.

![NIT Campuz Screenshot](https://storage.googleapis.com/aistudio-project-assets/projects/2655075f-2a2b-4560-8418-3c35b82293b6/e2e541fc-646e-4867-a2f0-51f153f5383f)

---

## ✨ Features

- Multi-Role Dashboards
- Role-Based Access Control (RBAC)
- Responsive Design
- AI-Powered Assistant (requires configuration)
- Reusable UI components
- Redux + Redux Saga for state management

---

## 🚀 Tech Stack

- Frontend: React + TypeScript
- State: Redux Toolkit + Redux Saga
- Styling: Tailwind CSS
- Animations: Framer Motion
- Charting: Recharts

---

## ⚙️ Getting Started (developer)

1. Clone or download the project files.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.

---

## Project Structure (high level)

```
/
├── components/
├── constants.ts
├── pages/
├── store/
├── types.ts
├── App.tsx
└── index.tsx
```

---

If you'd like edits to this README, tell me what to keep or add and I will update it.
<<<<<<< HEAD
# Nit_campuz_frontend
=======
# NIT Campuz - Multi-Role Learning Management System (LMS)

NIT Campuz is a comprehensive, modern Learning Management System designed for educational institutions. It features a sophisticated role-based access control system, providing tailored dashboards and functionalities for Admins, Principals, HODs, Staff, Students, and Exam Cell personnel. The application is enhanced with an integrated AI Assistant to streamline tasks and provide contextual support.

![NIT Campuz Screenshot](https://storage.googleapis.com/aistudio-project-assets/projects/2655075f-2a2b-4560-8418-3c35b82293b6/e2e541fc-646e-4867-a2f0-51f153f5383f)

---

## ✨ Features

- **Multi-Role Dashboards**: Unique, feature-rich dashboards for 6 different user roles.
- **Role-Based Access Control (RBAC)**: Secure access to features based on user permissions.
- **Responsive Design**: A seamless experience on desktop, tablet, and mobile devices, featuring a collapsible sidebar and a mobile-friendly bottom navigation bar.
- **AI-Powered Assistant**: An integrated chatbot using the Gemini API that provides role-aware assistance and information.
- **Rich UI Components**: A beautiful and consistent UI built with custom, reusable components, including tables, charts, dialogs, and animated notifications.
- **Robust State Management**: Centralized and predictable state management using Redux and Redux Saga.

### Role-Specific Functionality

#### 👨‍💻 Admin
- **User Management**: Create, view, filter, and manage all user accounts.
- **Bulk Actions**: Select multiple users to perform actions like promotion or disabling, with confirmation dialogs.
- **Department Management**: Create and manage institutional departments and assign HODs.
- **Alumni Tracking**: View and manage the alumni database with filtering and bulk export capabilities.
- **Activity Logs**: Monitor system-wide user activity.

#### 🧑‍🏫 Principal
- **Institutional Overview**: High-level dashboard with department performance analytics (e.g., average CGPA).
- **Directory**: View a complete directory of all staff and students with filtering options.
- **Department View**: Explore individual departments, their members, and class structures.

#### 👩‍🔬 Head of Department (HOD)
- **Department Dashboard**: Monitor key metrics like student count, staff count, and average CGPA for their specific department.
- **Staff Management**: View all staff members in the department and their assigned courses.
- **Student Monitoring**: Track academic progress, attendance, and internal marks status for all students in the department.

#### 👨‍🏫 Staff (Faculty)
- **Attendance Management**: Mark attendance with intuitive toggle switches, a "Mark All Present/Absent" button, and a final submission flow that locks the controls.
- **Marks Management**: Enter internal and final exam marks for students, with automatic GPA calculation.
- **Course Materials**: Upload and manage learning materials (PDFs, PPTs, Video Links) for assigned courses.

#### 🎓 Student
- **Personalized Dashboard**: View enrolled courses and upcoming assignment deadlines.
- **Assignments**: Track and submit assignments through an intuitive interface.
- **Grades & Performance**: View detailed grade reports, semester-wise SGPA, and overall CGPA.
- **Attendance Tracking**: Monitor overall and course-wise attendance percentages.

#### 📝 Exam Cell
- **Student Data Access**: Search for any student to view their complete academic transcript.
- **Result Publishing**: A step-by-step wizard to upload, verify, and publish semester results.
- **Reports & Analytics**: Generate department-wise pass percentage reports and view institutional toppers.
- **Exam Scheduling**: Create and manage schedules for both internal and final semester exams.

---

## 🚀 Tech Stack

- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Redux](https://redux.js.org/) with [Redux Toolkit](https://redux-toolkit.js.org/) & [Redux Saga](https://redux-saga.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charting**: [Recharts](https://recharts.org/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/)

---

## ⚙️ Getting Started

### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
- An active internet connection to load dependencies.

### Installation & Running
1.  **Download the project files.**
2.  **Set up the Gemini API Key:**
    -  This project requires a Google Gemini API key to enable the AI Chatbot feature.
    -  It is configured to read the key from a `process.env.API_KEY` variable. Ensure this environment variable is set in your deployment environment.
3.  **Open `index.html` in your browser.**
    -  The application uses an import map, so no build step is necessary for development. Simply open the `index.html` file directly.

---

## 📂 Project Structure

```
/
├── components/
│   ├── dashboards/     # Role-specific dashboard components
│   ├── icons/          # SVG icon components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── shared/         # Components shared across multiple dashboards
│   └── ui/             # Reusable base UI components (Button, Card, etc.)
├── constants.ts        # Mock data for the application
├── pages/              # Top-level page components (Login, Dashboard)
├── store/
│   ├── slices/         # Redux Toolkit slices
│   └── sagas/          # Redux Saga files for side effects
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component with routing
├── index.html          # Entry point HTML file
└── index.tsx           # React application entry point
```
>>>>>>> 3285152 (chore: initial import of nit_campuz_frontend)
