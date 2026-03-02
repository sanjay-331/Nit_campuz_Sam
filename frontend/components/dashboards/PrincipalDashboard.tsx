import React from 'react';
// FIX: Updated router components to be compatible with react-router-dom v6+.
// Replaced Switch with Routes and updated Route syntax.
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

import PrincipalHome from './principal/PrincipalHome';
import Directory from './principal/Directory';
import DepartmentView from './principal/DepartmentView';
import ODApprovals from './staff/ODApprovals';
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

const PrincipalDashboard: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<AnimatedPage><PrincipalHome /></AnimatedPage>} />
            <Route path="/directory" element={<AnimatedPage><Directory /></AnimatedPage>} />
            <Route path="/departments" element={<AnimatedPage><DepartmentView /></AnimatedPage>} />
            <Route path="/approvals" element={<AnimatedPage><ODApprovals /></AnimatedPage>} />
            {/* Reports page can be added later */}
            <Route path="/verifications" element={<AnimatedPage><DocumentVerification /></AnimatedPage>} />
        </Routes>
    );
};

export default PrincipalDashboard;