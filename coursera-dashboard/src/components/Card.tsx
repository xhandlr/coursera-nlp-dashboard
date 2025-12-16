import React, { ReactNode, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  noPadding?: boolean;
  insight?: {
    question: string;
    answer: ReactNode;
  };
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', action, noPadding = false, insight }) => {
  const [isInsightOpen, setIsInsightOpen] = useState(false);

  return (
    <div className={`bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 overflow-hidden flex flex-col h-full transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,50,200,0.1)] ${className}`}>
      {(title || subtitle) && (
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {title && <h3 className="font-bold text-gray-800 text-xl tracking-tight">{title}</h3>}
                {insight && (
                  <button
                    onClick={() => setIsInsightOpen(!isInsightOpen)}
                    className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded-full hover:bg-blue-50"
                    aria-label="Ver insight"
                    title={insight.question}
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              {subtitle && <p className="text-sm text-gray-400 mt-1 font-medium">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>

          {/* Insight Desplegable */}
          {insight && isInsightOpen && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 transition-all duration-300 ease-in-out">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2 flex-1">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="font-semibold text-gray-800 text-sm leading-relaxed">{insight.question}</p>
                </div>
                <button
                  onClick={() => setIsInsightOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cerrar insight"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar text-gray-700 text-sm leading-relaxed">
                {insight.answer}
              </div>
            </div>
          )}
        </div>
      )}
      <div className={`flex-grow relative ${noPadding ? '' : 'p-8 pt-2'}`}>
        {children}
      </div>
    </div>
  );
};