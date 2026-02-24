import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { NitCampuzLogo, MailIcon, CheckCircleIcon } from '../components/icons/Icons';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <NitCampuzLogo className="w-16 h-16 mx-auto text-indigo-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            {submitted ? "Check Your Email" : "Forgot Your Password?"}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {submitted ? "We've sent a password reset link." : "No worries! Enter your email and we'll send you a reset link."}
          </p>
        </div>
        
        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            <div>
              <Button type="submit" className="w-full" size="lg">
                Send Reset Link
              </Button>
            </div>
          </form>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-600">
                    If an account with <span className="font-semibold text-slate-800">{email}</span> exists, you will receive an email with reset instructions.
                </p>
                <p className="text-sm mt-4 text-slate-500">
                    For this demo, you can proceed by clicking the link below.
                </p>
                <Link to="/reset-password">
                    <Button variant="secondary" className="mt-4">
                        Proceed to Reset Password
                    </Button>
                </Link>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                &larr; Back to Login
            </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;