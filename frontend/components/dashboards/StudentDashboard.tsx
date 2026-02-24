import React from 'react';
// FIX: Updated router components to be compatible with react-router-dom v6+.
// Replaced Switch with Routes and updated Route syntax.
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

import StudentHome from './student/StudentHome';
import Assignments from './student/Assignments';
import Grades from './student/Grades';
import Attendance from './student/Attendance';
import StudentLibrary from './student/StudentLibrary';
import OnDuty from './student/OnDuty';

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

const StudentDashboard: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AnimatedPage><StudentHome /></AnimatedPage>} />
            <Route path="/assignments" element={<AnimatedPage><Assignments /></AnimatedPage>} />
            <Route path="/grades" element={<AnimatedPage><Grades /></AnimatedPage>} />
            <Route path="/attendance" element={<AnimatedPage><Attendance /></AnimatedPage>} />
            <Route path="/library" element={<AnimatedPage><StudentLibrary /></AnimatedPage>} />
            <Route path="/leave-od" element={<AnimatedPage><OnDuty /></AnimatedPage>} />
        </Routes>
    );
};

export default StudentDashboard;