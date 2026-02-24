import React from 'react';
// FIX: Updated router components to be compatible with react-router-dom v6+.
// Replaced Switch with Routes and updated Route syntax.
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

import StaffHome from './staff/StaffHome.tsx';
import AttendanceManagement from './staff/AttendanceManagement.tsx';
import MarksManagement from './staff/MarksManagement.tsx';
import MaterialsManagement from './staff/MaterialsManagement.tsx';
import ELibrary from './staff/ELibrary.tsx';
import SubmittedAssignments from './staff/SubmittedAssignments.tsx';
import ClassAdvisorView from './staff/ClassAdvisorView.tsx';
import MyMenteesView from './staff/MyMenteesView.tsx';
import OnDuty from './student/OnDuty';
import ODApprovals from './staff/ODApprovals';


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

const StaffDashboard: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AnimatedPage><StaffHome /></AnimatedPage>} />
            <Route path="/attendance" element={<AnimatedPage><AttendanceManagement /></AnimatedPage>} />
            <Route path="/marks" element={<AnimatedPage><MarksManagement /></AnimatedPage>} />
            <Route path="/assignments" element={<AnimatedPage><SubmittedAssignments /></AnimatedPage>} />
            <Route path="/leave-od" element={<AnimatedPage><OnDuty /></AnimatedPage>} />
            <Route path="/approvals" element={<AnimatedPage><ODApprovals /></AnimatedPage>} />
            <Route path="/materials" element={<AnimatedPage><MaterialsManagement /></AnimatedPage>} />
            <Route path="/library" element={<AnimatedPage><ELibrary /></AnimatedPage>} />
            <Route path="/class-advisor" element={<AnimatedPage><ClassAdvisorView /></AnimatedPage>} />
            <Route path="/my-mentees" element={<AnimatedPage><MyMenteesView /></AnimatedPage>} />
        </Routes>
    );
};

export default StaffDashboard;