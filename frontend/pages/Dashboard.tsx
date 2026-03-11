import React from 'react';
// FIX: Updated router components to be compatible with react-router-dom v6+.
// Replaced Switch with Routes and updated Route syntax.
import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { fetchUsersRequest, fetchDepartmentsRequest, fetchCoursesRequest, fetchAssignmentsRequest, fetchSubmissionsRequest, fetchMarksRequest, fetchAttendanceRequest, fetchMaterialsRequest, fetchExamSchedulesRequest, fetchMentorAssignmentsRequest, fetchRemarksRequest, fetchTutorsRequest, fetchTutorApplicationsRequest, fetchTutoringSessionsRequest, fetchOnDutyApplicationsRequest, fetchNoDuesCertificatesRequest } from '../store/slices/appSlice';
import { UserRole } from '../types';
import DashboardLayout from '../components/layout/DashboardLayout';
import AIChatbot from '../components/AIChatbot';
import { motion } from 'framer-motion';

// Use static imports instead of lazy loading to fix module resolution errors
import AdminDashboard from '../components/dashboards/AdminDashboard.tsx';
import PrincipalDashboard from '../components/dashboards/PrincipalDashboard.tsx';
import HodDashboard from '../components/dashboards/HodDashboard.tsx';
import StaffDashboard from '../components/dashboards/StaffDashboard.tsx';
import StudentDashboard from '../components/dashboards/StudentDashboard.tsx';
import ExamCellDashboard from '../components/dashboards/ExamCellDashboard.tsx';
import ProfilePage from './Profile.tsx';
import PermissionsPage from './Permissions.tsx';
import UserProfilePage from './UserProfile.tsx';
import HelpPage from './Help.tsx';

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

const DashboardPage: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (user) {
      // Basic common data
      dispatch(fetchDepartmentsRequest());
      dispatch(fetchCoursesRequest());

      // Role-specific data fetching
      switch (user.role) {
        case UserRole.ADMIN:
          dispatch(fetchUsersRequest());
          dispatch(fetchOnDutyApplicationsRequest());
          dispatch(fetchNoDuesCertificatesRequest());
          dispatch(fetchTutorApplicationsRequest());
          break;
        case UserRole.PRINCIPAL:
          dispatch(fetchOnDutyApplicationsRequest());
          dispatch(fetchNoDuesCertificatesRequest());
          break;
        case UserRole.HOD:
          dispatch(fetchUsersRequest()); // Only for their dept ideally, but current backend fetches all
          dispatch(fetchOnDutyApplicationsRequest());
          dispatch(fetchTutorApplicationsRequest());
          dispatch(fetchNoDuesCertificatesRequest());
          break;
        case UserRole.STAFF:
          dispatch(fetchAttendanceRequest());
          dispatch(fetchMarksRequest());
          dispatch(fetchMaterialsRequest());
          dispatch(fetchAssignmentsRequest());
          dispatch(fetchSubmissionsRequest());
          dispatch(fetchOnDutyApplicationsRequest());
          break;
        case UserRole.STUDENT:
          dispatch(fetchAssignmentsRequest());
          dispatch(fetchMarksRequest());
          dispatch(fetchAttendanceRequest());
          dispatch(fetchMaterialsRequest());
          dispatch(fetchExamSchedulesRequest());
          dispatch(fetchMentorAssignmentsRequest());
          dispatch(fetchRemarksRequest());
          dispatch(fetchTutorsRequest());
          dispatch(fetchTutoringSessionsRequest());
          dispatch(fetchOnDutyApplicationsRequest()); // For their own applications
          break;
        case UserRole.EXAM_CELL:
          dispatch(fetchExamSchedulesRequest());
          dispatch(fetchMarksRequest());
          break;
      }
    }
  }, [dispatch, user]);

  const renderDashboard = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return <AdminDashboard />;
      case UserRole.PRINCIPAL:
        return <AnimatedPage><PrincipalDashboard /></AnimatedPage>;
      case UserRole.HOD:
        return <AnimatedPage><HodDashboard /></AnimatedPage>;
      case UserRole.STAFF:
        return <AnimatedPage><StaffDashboard /></AnimatedPage>;
      case UserRole.STUDENT:
        return <AnimatedPage><StudentDashboard /></AnimatedPage>;
      case UserRole.EXAM_CELL:
        return <AnimatedPage><ExamCellDashboard /></AnimatedPage>;
      default:
        return <div>Invalid Role</div>;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
        <Route path="/profile/:userId" element={<AnimatedPage><UserProfilePage /></AnimatedPage>} />
        <Route path="/permissions" element={<AnimatedPage><PermissionsPage /></AnimatedPage>} />
        <Route path="/help" element={<AnimatedPage><HelpPage /></AnimatedPage>} />
        <Route path="/*" element={renderDashboard()} />
      </Routes>
      <AIChatbot />
    </DashboardLayout>
  );
};

export default DashboardPage;