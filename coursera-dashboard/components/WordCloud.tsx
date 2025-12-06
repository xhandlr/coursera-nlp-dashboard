import React from 'react';
import { wordCloudData } from '../constants';

export const WordCloud: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden py-16 bg-gradient-to-b from-[#E3F2FD]/20 to-[#E3F2FD] border-t border-blue-50">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
      
      <div className="text-center mb-12">
        <h2 className="text-2xl font-extrabold text-[#0056D2] tracking-tight">Voces de los Estudiantes</h2>
        <p className="text-slate-500 font-medium mt-2">Conceptos más frecuentes en reseñas y foros</p>
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-wrap justify-center items-center gap-x-12 gap-y-6 px-10 pb-10">
        {wordCloudData.map((item, index) => {
          // Calculate dynamic size - significantly reduced factor from 0.5 to 0.25 + base
          const fontSize = `${Math.max(0.9, item.value * 0.35)}rem`; 
          const opacity = Math.min(1, Math.max(0.6, item.value / 10));
          // Randomize animation delay for natural feel
          const delay = `${Math.random() * 5}s`;
          
          return (
            <span 
              key={index}
              className="font-extrabold cursor-default transition-all duration-300 hover:scale-110 animate-float select-none"
              style={{ 
                fontSize: fontSize, 
                color: item.color,
                opacity: opacity,
                animationDelay: delay,
                textShadow: '0 2px 4px rgba(255,255,255,0.5)' // Reduced shadow
              }}
            >
              {item.text}
            </span>
          );
        })}
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
    </div>
  );
};