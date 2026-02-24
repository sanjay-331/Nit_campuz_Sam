import React from 'react';
// FIX: Updated NavLink to be compatible with react-router-dom v6+.
// Replaced activeClassName/exact props with a className function and the 'end' prop.
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { UserRole } from '../../types';
import { DashboardIcon, UsersIcon, DocumentReportIcon, AcademicCapIcon, ClipboardListIcon, BriefcaseIcon, UploadIcon, OfficeBuildingIcon, BarChartIcon, BeakerIcon, BookOpenIcon, PencilIcon, ShieldCheckIcon } from '../icons/Icons';
import { motion } from 'framer-motion';

interface BottomNavLink {
  name: string;
  path: string;
  icon: React.FC<{ className?: string }>;
}

const bottomNavLinks: Record<string, BottomNavLink[]> = {
    [UserRole.ADMIN]: [
      { name: 'Dashboard', path: '/', icon: DashboardIcon },
      { name: 'Users', path: '/users', icon: UsersIcon },
      { name: 'Depts', path: '/departments', icon: OfficeBuildingIcon },
      { name: 'Logs', path: '/logs', icon: ClipboardListIcon },
    ],
    [UserRole.PRINCIPAL]: [
      { name: 'Dashboard', path: '/', icon: DashboardIcon },
      { name: 'Directory', path: '/directory', icon: UsersIcon },
      { name: 'Depts', path: '/departments', icon: OfficeBuildingIcon },
      { name: 'Reports', path: '/reports', icon: BarChartIcon },
    ],
    [UserRole.HOD]: [
      { name: 'Dashboard', path: '/', icon: DashboardIcon },
      { name: 'Staff', path: '/staff', icon: UsersIcon },
      { name: 'Students', path: '/students', icon: AcademicCapIcon },
      { name: 'Resources', path: '/resources', icon: BeakerIcon },
    ],
    [UserRole.STAFF]: [
      { name: 'Dashboard', path: '/', icon: DashboardIcon },
      { name: 'Attend.', path: '/attendance', icon: ClipboardListIcon },
      { name: 'Marks', path: '/marks', icon: DocumentReportIcon },
      { name: 'Assign.', path: '/assignments', icon: PencilIcon },
      { name: 'Library', path: '/library', icon: BriefcaseIcon },
    ],
    [UserRole.STUDENT]: [
      { name: 'Dashboard', path: '/', icon: DashboardIcon },
      { name: 'Assignments', path: '/assignments', icon: PencilIcon },
      { name: 'Grades', path: '/grades', icon: DocumentReportIcon },
      { name: 'Attend.', path: '/attendance', icon: ClipboardListIcon },
      { name: 'Library', path: '/library', icon: BookOpenIcon },
    ],
    [UserRole.EXAM_CELL]: [
      { name: 'Dashboard', path: '/', icon: DashboardIcon },
      { name: 'Data', path: '/student-data', icon: UsersIcon },
      { name: 'Results', path: '/results', icon: UploadIcon },
      { name: 'Reports', path: '/reports', icon: BarChartIcon },
    ],
};
  

const BottomNavBar: React.FC = () => {
    const user = useSelector(selectUser);
    const links = user ? bottomNavLinks[user.role] || [] : [];

    if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 md:hidden z-40">
        <nav className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${links.length}, 1fr)`}}>
            {links.map(link => (
                <NavLink 
                    key={link.name} 
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) => 
                        `relative flex flex-col items-center justify-center text-center transition-colors duration-200 text-gray-500 hover:text-blue-600 ${
                            isActive ? 'text-blue-600' : ''
                        }`
                    }
                >
                    <link.icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{link.name}</span>
                </NavLink>
            ))}
        </nav>
    </div>
  );
};

export default BottomNavBar;