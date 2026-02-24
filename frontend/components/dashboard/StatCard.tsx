import React, { ReactNode } from 'react';
import { Card, CardContent } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'indigo' | 'green' | 'amber' | 'sky';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    sky: 'bg-sky-100 text-sky-600',
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        {icon && (
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                {icon}
            </div>
        )}
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;