import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { UserRole } from '../types';

import TutorManagement from '../components/dashboards/hod/TutorManagement';
import PeerTutoring from '../components/dashboards/student/PeerTutoring';

const TutoringPage: React.FC = () => {
  const user = useSelector(selectUser);

  switch (user?.role) {
    case UserRole.HOD:
    case UserRole.ADMIN: // Admins can also manage
      return <TutorManagement />;
    case UserRole.STUDENT:
      return <PeerTutoring />;
    default:
      // Render a fallback or null for other roles who might land here
      return (
        <div>
            <h1 className="text-3xl font-bold">Tutoring</h1>
            <p className="text-gray-500">This feature is not available for your role.</p>
        </div>
      );
  }
};

export default TutoringPage;
