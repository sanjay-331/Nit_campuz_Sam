import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, selectAuthError, selectAuthLoading } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { NitCampuzLogo, MailIcon, LockClosedIcon, CheckCircleIcon, XIcon } from '../components/icons/Icons';
import { Link, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const error = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === 'success') {
      setShowResetSuccess(true);
      const timer = setTimeout(() => setShowResetSuccess(false), 5000);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequest(email));
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    dispatch(loginRequest(userEmail));
  }
  
  const quickLoginUsers = [
    { email: 'admin@nitcampuz.edu', role: 'Admin' },
    { email: 'principal@nitcampuz.edu', role: 'Principal' },
    { email: 'hod.cse@nitcampuz.edu', role: 'HOD' },
    { email: 'sarah.w@nitcampuz.edu', role: 'Staff' },
    { email: 'alex.j@nitcampuz.edu', role: 'Student' },
    { email: 'examcell@nitcampuz.edu', role: 'Exam Cell' },
  ];

  const tryLogin = () => {
    // Redux saga now handles this flow
    dispatch(loginRequest(email));
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <AnimatePresence>
        {showResetSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="fixed top-6 right-6 z-50 w-full max-w-sm p-4 bg-slate-800 text-white rounded-2xl shadow-lg flex items-center"
          >
              <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3" />
              <div>
                  <p className="font-semibold">Password Reset Successfully!</p>
                  <p className="text-sm text-slate-300">You can now log in with your new password.</p>
              </div>
              <button onClick={() => setShowResetSuccess(false)} className="ml-auto p-1 rounded-full hover:bg-slate-700">
                  <XIcon className="w-4 h-4" />
              </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 text-white text-center">
        <NitCampuzLogo className="w-24 h-24 mb-6" />
        <h1 className="text-4xl font-bold tracking-tight">Welcome to NIT Campuz</h1>
        <p className="mt-4 text-lg max-w-md text-indigo-200">
          Your integrated platform for seamless academic management and collaboration.
        </p>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <NitCampuzLogo className="w-16 h-16 mx-auto text-indigo-600 lg:hidden" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Welcome back!</h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Sign in to access your dashboard
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="rounded-md shadow-sm space-y-4">
                <div className="relative">
                   <MailIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-slate-900 bg-slate-100 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    placeholder="Email address"
                  />
                </div>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-slate-900 bg-slate-100 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    placeholder="Password"
                  />
                </div>
              </div>
            <div className="text-sm text-right">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                </Link>
            </div>
            {error && <p className="text-sm text-red-600 pt-1 text-center">{error}</p>}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                onClick={() => tryLogin()}
                loading={loading}
              >
                Sign In
              </Button>
            </div>
          </form>
           <div className="pt-6">
             <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-50 text-slate-500">Or quick login as</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
                {quickLoginUsers.map(user => (
                    <Button 
                      key={user.email} 
                      onClick={() => quickLogin(user.email)} 
                      variant="secondary"
                      className="w-full border border-slate-200 !font-medium"
                      disabled={loading}
                    >
                        {user.role}
                    </Button>
                ))}
            </div>
        </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
