import React from 'react';
import { BarChart3 } from 'lucide-react';
import coursera_logo from '../assets/coursera_icon.png';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 py-5 px-8 border-b border-blue-100 shadow-sm transition-all">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
           {/* Icono de Coursera */}
           <div className="flex items-center justify-center">
             <BarChart3 className="w-9 h-9 text-[#0056D2]" strokeWidth={2.5} />
           </div>
           
           <div className="flex items-center gap-4 border-l-2 border-gray-200 pl-6">
             <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tighter leading-none">
                  Coursera <span className="text-[#0056D2]">Analytics</span>
                </h1>
                <p className="text-[11px] text-gray-500 font-semibold tracking-wide mt-1 uppercase">Dashboard Institucional</p>
             </div>
             
             {/* Espacio para imagen institucional */}
             <div className="hidden sm:block h-10 w-28 rounded-lg flex items-center justify-center ml-4">
                <img src={coursera_logo} alt="Logo de Coursera" className="max-h-8 object-contain" />
             </div>
           </div>
        </div>

        <div className="text-xs font-bold text-[#0056D2] bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
           Reporte 2024
        </div>
      </div>
    </header>
  );
};