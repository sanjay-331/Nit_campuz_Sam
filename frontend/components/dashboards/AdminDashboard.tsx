import React from 'react';
// FIX: Updated router components to be compatible with react-router-dom v6+.
// Replaced Switch with Routes and updated Route syntax.
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Use static imports instead of lazy loading to fix module resolution errors
import AdminHome from './admin/AdminHome.tsx';
import UserManagement from './admin/UserManagement.tsx';
import DepartmentManagement from './admin/DepartmentManagement.tsx';
import AlumniManagement from './admin/AlumniManagement.tsx';
import ActivityLogs from './admin/ActivityLogs.tsx';
import AttendanceAnalytics from './admin/AttendanceAnalytics.tsx';
import PromoteStudents from './admin/PromoteStudents.tsx';
import DocumentVerification from './admin/DocumentVerification.tsx';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
} as const;

const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
    >
        {children}
    </motion.div>
);

const AdminDashboard: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AnimatedPage><AdminHome /></AnimatedPage>} />
            <Route path="/users" element={<AnimatedPage><UserManagement /></AnimatedPage>} />
            <Route path="/departments" element={<AnimatedPage><DepartmentManagement /></AnimatedPage>} />
            <Route path="/alumni" element={<AnimatedPage><AlumniManagement /></AnimatedPage>} />
            <Route path="/promote" element={<AnimatedPage><PromoteStudents /></AnimatedPage>} />
            <Route path="/attendance-analytics" element={<AnimatedPage><AttendanceAnalytics /></AnimatedPage>} />
            <Route path="/verifications" element={<AnimatedPage><DocumentVerification /></AnimatedPage>} />
            <Route path="/logs" element={<AnimatedPage><ActivityLogs /></AnimatedPage>} />
        </Routes>
    );
};

export default AdminDashboard;