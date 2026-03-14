import React from 'react';
// FIX: Updated router components to be compatible with react-router-dom v6+.
// Replaced Switch with Routes and updated Route syntax.
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

import HodHome from './hod/HodHome';
import StaffManagement from './hod/StaffManagement';
import StudentMonitoring from './hod/StudentMonitoring';
import Resources from './hod/Resources';
import AssignAdvisor from './hod/AssignAdvisor';
import MentorManagement from './hod/MentorManagement';
import ODApprovals from './staff/ODApprovals';
import OnDuty from './student/OnDuty';
import PromoteStudents from './admin/PromoteStudents';
import DocumentVerification from './admin/DocumentVerification';

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

import MarksVerification from '../shared/MarksVerification';

const HodDashboard: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AnimatedPage><HodHome /></AnimatedPage>} />
            <Route path="/staff" element={<AnimatedPage><StaffManagement /></AnimatedPage>} />
            <Route path="/students" element={<AnimatedPage><StudentMonitoring /></AnimatedPage>} />
            <Route path="/advisors" element={<AnimatedPage><AssignAdvisor /></AnimatedPage>} />
            <Route path="/mentors" element={<AnimatedPage><MentorManagement /></AnimatedPage>} />
            <Route path="/promote" element={<AnimatedPage><PromoteStudents /></AnimatedPage>} />
            <Route path="/leave-od" element={<AnimatedPage><OnDuty /></AnimatedPage>} />
            <Route path="/resources" element={<AnimatedPage><Resources /></AnimatedPage>} />
            <Route path="/approvals" element={<AnimatedPage><ODApprovals /></AnimatedPage>} />
            <Route path="/verifications" element={<AnimatedPage><DocumentVerification /></AnimatedPage>} />
            <Route path="/marks-verification" element={<AnimatedPage><MarksVerification /></AnimatedPage>} />
        </Routes>
    );
};


export default HodDashboard;