import React from 'react';
import { DocumentReportIcon } from '../icons/Icons';

interface EmptyStateProps {
    title: string;
    message: string;
    icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
    title, 
    message, 
    icon = <DocumentReportIcon className="w-12 h-12 text-gray-300" /> 
}) => {
    return (
        <div className="text-center py-16 px-6">
            <div className="mx-auto h-16 w-16 flex items-center justify-center bg-gray-100 rounded-full">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
        </div>
    );
};

export default EmptyState;
