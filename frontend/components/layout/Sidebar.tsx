import React from 'react';
// FIX: Updated NavLink to be compatible with react-router-dom v6+.
// Replaced activeClassName/exact props with a className function and the 'end' prop.
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectCan, selectUserPermissions } from '../../store/slices/authSlice';
import { UserRole, Permission } from '../../types';
import { DashboardIcon, UsersIcon, BookOpenIcon, AcademicCapIcon, ClipboardListIcon, BeakerIcon, OfficeBuildingIcon, DocumentReportIcon, XIcon, BriefcaseIcon, UploadIcon, PencilIcon, SettingsIcon, LifebuoyIcon, BarChartIcon, UserIcon, NitCampuzLogo, ShieldCheckIcon, HeartIcon, CheckCircleIcon, RocketIcon } from '../icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { selectAllClasses, selectAllMentorAssignments } from '../../store/slices/appSlice';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

interface SidebarLink {
  name: string;
  path: string;
  icon: React.FC<{ className?: string }>;
  permission?: Permission;
  isAdvisor?: boolean;
  isMentor?: boolean;
}


const sidebarLinks: Record<UserRole, SidebarLink[]> = {
  [UserRole.ADMIN]: [
    { name: 'Dashboard', path: '/', icon: DashboardIcon, permission: Permission.VIEW_USERS },
    { name: 'Users', path: '/users', icon: UsersIcon, permission: Permission.MANAGE_USERS },
    { name: 'Departments', path: '/departments', icon: OfficeBuildingIcon, permission: Permission.MANAGE_DEPARTMENTS },
    // FIX: Corrected truncated permission name.
    { name: 'Alumni', path: '/alumni', icon: AcademicCapIcon, permission: Permission.MANAGE_ALUMNI },
    { name: 'Promote', path: '/promote', icon: RocketIcon, permission: Permission.PROMOTE_STUDENTS },
    { name: 'Attendance', path: '/attendance-analytics', icon: BarChartIcon, permission: Permission.GENERATE_REPORTS },
    { name: 'Logs', path: '/logs', icon: ClipboardListIcon, permission: Permission.VIEW_LOGS },
    { name: 'Verifications', path: '/verifications', icon: ShieldCheckIcon, permission: Permission.MANAGE_USERS },
    { name: 'Permissions', path: '/permissions', icon: ShieldCheckIcon, permission: Permission.MANAGE_USERS },
  ],
  [UserRole.PRINCIPAL]: [
    { name: 'Dashboard', path: '/', icon: DashboardIcon, permission: Permission.VIEW_USERS },
    { name: 'Directory', path: '/directory', icon: UsersIcon, permission: Permission.VIEW_USERS },
    { name: 'Departments', path: '/departments', icon: OfficeBuildingIcon, permission: Permission.VIEW_DEPARTMENTS },
    { name: 'Approvals', path: '/approvals', icon: CheckCircleIcon, permission: Permission.VIEW_USERS }, // Assume view_users
    { name: 'Verifications', path: '/verifications', icon: ShieldCheckIcon, permission: Permission.VIEW_USERS },
    { name: 'Verify Results', path: '/marks-verification', icon: CheckCircleIcon, permission: Permission.VIEW_USERS },
    { name: 'Reports', path: '/reports', icon: DocumentReportIcon, permission: Permission.GENERATE_REPORTS },
  ],
  [UserRole.HOD]: [
    { name: 'Dashboard', path: '/', icon: DashboardIcon, permission: Permission.VIEW_USERS },
    { name: 'Staff', path: '/staff', icon: UsersIcon, permission: Permission.VIEW_USERS },
    { name: 'Students', path: '/students', icon: AcademicCapIcon, permission: Permission.VIEW_USERS },
    { name: 'Advisors', path: '/advisors', icon: UserIcon, permission: Permission.VIEW_USERS },
    { name: 'Mentors', path: '/mentors', icon: HeartIcon, permission: Permission.VIEW_USERS },
    { name: 'Promote', path: '/promote', icon: RocketIcon, permission: Permission.PROMOTE_STUDENTS },
    { name: 'Leave / OD', path: '/leave-od', icon: BriefcaseIcon, permission: Permission.VIEW_USERS },
    { name: 'Resources', path: '/resources', icon: BeakerIcon, permission: Permission.VIEW_USERS },
    { name: 'Approvals', path: '/approvals', icon: CheckCircleIcon, permission: Permission.VIEW_USERS },
    { name: 'Verifications', path: '/verifications', icon: ShieldCheckIcon, permission: Permission.VIEW_USERS },
    { name: 'Verify Results', path: '/marks-verification', icon: CheckCircleIcon, permission: Permission.VIEW_USERS },
  ],
  [UserRole.STAFF]: [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Attendance', path: '/attendance', icon: ClipboardListIcon },
    { name: 'Marks', path: '/marks', icon: DocumentReportIcon },
    { name: 'Assignments', path: '/assignments', icon: PencilIcon },
    { name: 'Leave / OD', path: '/leave-od', icon: BriefcaseIcon },
    { name: 'Approvals', path: '/approvals', icon: CheckCircleIcon },
    { name: 'Materials', path: '/materials', icon: UploadIcon },
    { name: 'e-Library', path: '/library', icon: BookOpenIcon },
    // FIX: Added missing 'icon' property.
    { name: 'Class Advisor', path: '/class-advisor', icon: UserIcon, isAdvisor: true },
    // FIX: Added missing 'icon' property.
    { name: 'My Mentees', path: '/my-mentees', icon: HeartIcon, isMentor: true },
  ],
  [UserRole.STUDENT]: [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Assignments', path: '/assignments', icon: PencilIcon },
    { name: 'Grades', path: '/grades', icon: DocumentReportIcon },
    { name: 'Attendance', path: '/attendance', icon: ClipboardListIcon },
    { name: 'e-Library', path: '/library', icon: BookOpenIcon },
    { name: 'Leave / OD', path: '/leave-od', icon: BriefcaseIcon },
    { name: 'Documents', path: '/documents', icon: UploadIcon },
  ],
  [UserRole.EXAM_CELL]: [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Student Data', path: '/student-data', icon: UsersIcon },
    { name: 'Results', path: '/results', icon: UploadIcon },
    { name: 'Reports', path: '/reports', icon: DocumentReportIcon },
    { name: 'Schedules', path: '/schedules', icon: ClipboardListIcon },
  ],
};


const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobileOpen, setMobileOpen, setIsSettingsOpen }) => {
    const user = useSelector(selectUser);
    const permissions = useSelector(selectUserPermissions);
    const canConfigureSystem = useSelector(selectCan(Permission.CONFIGURE_SYSTEM));

    // For staff-specific links
    const classes = useSelector(selectAllClasses);
    const mentorAssignments = useSelector(selectAllMentorAssignments);
    const isAdvisor = user ? classes.some(c => c.advisorId === user.id) : false;
    const isMentor = user ? mentorAssignments.some(m => m.mentorId === user.id) : false;

    const links = user ? (sidebarLinks[user.role] || []) : [];
    
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-3 my-1 rounded-xl transition-colors duration-200 ${
        isCollapsed ? 'justify-center' : ''
    } ${
        isActive
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
    }`;

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} h-20 border-b border-slate-200`}>
                <NitCampuzLogo className={`w-10 h-10 transition-all ${isCollapsed ? '' : 'mr-2'}`} />
                {!isCollapsed && <span className="font-bold text-2xl tracking-tight">NIT Campuz</span>}
            </div>
            <nav className="flex-1 px-4 py-4 overflow-y-auto">
                {links.map((link: SidebarLink) => {
                    const hasPermission = !link.permission || permissions.includes(link.permission);
                    if (!hasPermission) return null;
                    if (link.isAdvisor && !isAdvisor) return null;
                    if (link.isMentor && !isMentor) return null;

                    return (
                        <NavLink key={link.name} to={link.path} end={link.path === '/'} className={navLinkClass}>
                            <link.icon className={`w-6 h-6 flex-shrink-0 ${!isCollapsed && 'mr-3'}`} />
                            {!isCollapsed && <span className="font-medium">{link.name}</span>}
                        </NavLink>
                    );
                })}
            </nav>
            <div className="px-4 py-4 border-t border-slate-200">
                <button onClick={() => setIsSettingsOpen(true)} className={navLinkClass({isActive: false})}>
                    <SettingsIcon className={`w-6 h-6 flex-shrink-0 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span className="font-medium">Settings</span>}
                </button>
                <NavLink to="/help" className={navLinkClass}>
                    <LifebuoyIcon className={`w-6 h-6 flex-shrink-0 ${!isCollapsed && 'mr-3'}`} />
                    {!isCollapsed && <span className="font-medium">Help & Support</span>}
                </NavLink>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isMobileOpen && (
                     <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 z-50 h-full w-64 bg-white lg:hidden"
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className={`hidden md:block fixed top-0 left-0 h-full bg-white z-40 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24' : 'w-64'}`}>
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;