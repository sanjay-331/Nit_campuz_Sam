import React, { ReactNode, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';
import BottomNavBar from './BottomNavBar';
import SettingsSheet from '../shared/SettingsSheet';
import { selectCan } from '../../store/slices/authSlice';
import { Permission } from '../../types';
import Toast from '../shared/Toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const canConfigureSystem = useSelector(selectCan(Permission.CONFIGURE_SYSTEM));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isMobileOpen={isMobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      <div className={`flex flex-col flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${!isSidebarCollapsed ? 'md:ml-64' : 'md:ml-24'}`}>
        <Header 
          setMobileSidebarOpen={setMobileSidebarOpen} 
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          setIsSettingsOpen={setIsSettingsOpen}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {children}
              </motion.div>
            </div>
            
            <footer className="mt-8 border-t border-slate-200 pt-6 pb-2 text-center">
              <p className="text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-slate-300"></span>
                Developed by <span className="text-indigo-600 font-bold uppercase tracking-tight">CSE Department</span>
                <span className="h-px w-8 bg-slate-300"></span>
              </p>
            </footer>
        </main>
        <BottomNavBar />
      </div>
      <SettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <Toast />
    </div>
  );
};

export default DashboardLayout;
