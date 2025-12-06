import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', action, noPadding = false }) => {
  return (
    <div className={`bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 overflow-hidden flex flex-col h-full transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,50,200,0.1)] ${className}`}>
      {(title || subtitle) && (
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            {title && <h3 className="font-bold text-gray-800 text-xl tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400 mt-1 font-medium">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`flex-grow relative ${noPadding ? '' : 'p-8 pt-2'}`}>
        {children}
      </div>
    </div>
  );
};