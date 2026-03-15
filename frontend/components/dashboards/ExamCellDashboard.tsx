import React from 'react';
// FIX: Updated router components to be compatible with react-router-dom v6+.
// Replaced Switch with Routes and updated Route syntax.
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import ExamCellHome from './exam-cell/ExamCellHome';
import StudentDataAccess from './exam-cell/StudentDataAccess';
import ResultPublishing from './exam-cell/ResultPublishing';
import ReportsAnalytics from './exam-cell/ReportsAnalytics';
import ExamSchedules from './exam-cell/ExamSchedules';

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

const ExamCellDashboard: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AnimatedPage><ExamCellHome /></AnimatedPage>} />
            <Route path="/student-data" element={<AnimatedPage><StudentDataAccess /></AnimatedPage>} />
            <Route path="/results" element={<AnimatedPage><ResultPublishing /></AnimatedPage>} />
            <Route path="/reports" element={<AnimatedPage><ReportsAnalytics /></AnimatedPage>} />
            <Route path="/schedules" element={<AnimatedPage><ExamSchedules /></AnimatedPage>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default ExamCellDashboard;