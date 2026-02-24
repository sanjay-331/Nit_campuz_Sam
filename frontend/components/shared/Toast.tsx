import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, WarningIcon, XIcon } from '../icons/Icons';
import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../../store/slices/uiSlice';
import { RootState } from '../../store';

const Toast: React.FC = () => {
    const toast = useSelector((state: RootState) => state.ui.toast);
    const dispatch = useDispatch();

    if (!toast) return null;

    const { message, type, title } = toast;

    const toastVariants = {
        success: { bg: 'bg-slate-800', icon: <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" /> },
        error: { bg: 'bg-red-600', icon: <WarningIcon className="w-6 h-6 text-white mr-3 flex-shrink-0" /> }
    };

    const config = toastVariants[type];

    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className={`fixed bottom-6 right-6 z-50 w-full max-w-sm p-4 ${config.bg} text-white rounded-2xl shadow-lg flex items-start`}
                >
                    {config.icon}
                    <div>
                        <p className="font-semibold">{title || (type === 'success' ? 'Success!' : 'Error')}</p>
                        <p className={`text-sm ${type === 'success' ? 'text-slate-200' : 'text-white'}`}>{message}</p>
                    </div>
                    <button onClick={() => dispatch(hideToast())} className="ml-auto p-1 rounded-full hover:bg-slate-700 flex-shrink-0">
                       <XIcon className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Toast;
