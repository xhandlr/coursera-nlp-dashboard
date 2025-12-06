import React from 'react';

interface KPIScorecardProps {
  label: string;
  value: string;
  trend?: string;
  isPositive?: boolean;
}

export const KPIScorecard: React.FC<KPIScorecardProps> = ({ label, value, trend, isPositive }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-[2rem] shadow-sm border border-blue-50 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Decorative background circle */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
      
      <h3 className="text-6xl lg:text-5xl font-extrabold text-[#0056D2] tracking-tighter mb-4 relative z-10">
        {value}
      </h3>
      <p className="text-slate-600 font-bold uppercase tracking-widest text-xs mb-5 z-10">{label}</p>
      
      {trend && (
        <div className={`z-10 px-4 py-2 rounded-full text-sm font-extrabold flex items-center gap-2 shadow-sm border ${
          isPositive 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200'
        }`}>
          <span className="text-lg leading-none">{isPositive ? '↑' : '↓'}</span>
          <span>{trend}</span>
          <span className={`text-[11px] font-semibold ml-1 ${isPositive ? 'text-green-700' : 'text-red-700'}`}>vs año anterior</span>
        </div>
      )}
    </div>
  );
};