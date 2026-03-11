import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout, selectCan } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { LogoutIcon, SearchIcon, SettingsIcon, MenuIcon, BellIcon, ChevronLeftIcon, UserIcon } from '../icons/Icons';
import Button from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import Notifications from '../shared/Notifications';
import SettingsSheet from '../shared/SettingsSheet';
import { Permission } from '../../types';
import { Link } from 'react-router-dom';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const Header: React.FC<{ 
  setMobileSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setIsSettingsOpen: (open: boolean) => void;
}> = ({ setMobileSidebarOpen, isSidebarCollapsed, toggleSidebarCollapse, setIsSettingsOpen }) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();
  const canConfigureSystem = useSelector(selectCan(Permission.CONFIGURE_SYSTEM));

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === '/') {
         event.preventDefault();
         searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100"
              aria-label="Open sidebar"
          >
              <MenuIcon className="w-6 h-6" />
          </button>
          <button
              onClick={toggleSidebarCollapse}
              className="hidden md:block p-2 text-slate-600 rounded-lg hover:bg-slate-100"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
              <ChevronLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isSidebarCollapsed && 'rotate-180'}`} />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold text-slate-900">Hello, {user?.name.split(' ')[0]}!</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="relative hidden md:block">
              <SearchIcon className="absolute w-5 h-5 text-slate-400 top-1/2 left-4 -translate-y-1/2" />
              <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search... ( / )"
                  className="w-full pl-11 pr-4 py-2.5 text-sm text-slate-900 bg-slate-100 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>

          <Notifications />

          <Button variant="ghost" size="sm" className="!p-2.5" onClick={() => setIsSettingsOpen(true)} aria-label="Settings">
            <SettingsIcon className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-sm" aria-label="Open user menu">
                {getInitials(user?.name ?? '')}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold text-sm text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-600 font-normal">{user?.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <Link to="/profile" className="flex items-center w-full px-2 py-1.5">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogoutIcon className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>
    </>
  );
};

export default Header;