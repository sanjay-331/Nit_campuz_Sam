import React from 'react';
import MarksVerification from '../../shared/MarksVerification';

const ResultPublishing: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Result Publishing & Verification</h1>
                <p className="text-gray-500">Manage the end-to-end result publication workflow.</p>
            </div>
            
            <MarksVerification />
        </div>
    );
};

export default ResultPublishing;

