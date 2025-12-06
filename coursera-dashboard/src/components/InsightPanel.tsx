import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';

interface InsightItemProps {
  title: string;
  type: 'negative' | 'positive' | 'neutral';
  children: React.ReactNode;
}

const InsightItem: React.FC<InsightItemProps> = ({ title, type, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const colors = {
    negative: 'border-l-red-500 bg-red-50/50',
    positive: 'border-l-green-500 bg-green-50/50',
    neutral: 'border-l-blue-500 bg-blue-50/50'
  };

  const icons = {
    negative: <AlertCircle className="w-4 h-4 text-red-500" />,
    positive: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    neutral: <Lightbulb className="w-4 h-4 text-blue-500" />
  };

  return (
    <div className={`mb-4 border-l-4 rounded-r-lg ${colors[type]} p-3 transition-all duration-200`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <div className="flex items-center gap-2">
          {icons[type]}
          <span className="font-semibold text-sm text-gray-800">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      
      {isOpen && (
        <div className="mt-2 text-xs text-gray-600 pl-6 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export const InsightPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 w-full lg:w-80 shadow-lg">
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <h2 className="flex items-center gap-2 font-bold text-gray-800">
          <MessageSquare className="w-5 h-5 text-coursera-blue" />
          Insights & Hallazgos
        </h2>
        <p className="text-xs text-gray-500 mt-1">Análisis cualitativo del periodo</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <InsightItem title="Reseñas Negativas" type="negative">
          <p className="mb-2">Los estudiantes reportan problemas de audio en cursos antiguos.</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-medium">Audio</span>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-medium">Desactualizado</span>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-medium">Soporte</span>
          </div>
        </InsightItem>

        <InsightItem title="Correlación Precio/Calidad" type="neutral">
          <p>No existe una correlación directa significativa entre precio alto y mejor rating, lo que sugiere una oportunidad para democratizar costos sin perder prestigio.</p>
        </InsightItem>

        <InsightItem title="Retención vs. Duración" type="negative">
          <p>Se detecta un <strong>"Punto de Quiebre"</strong> en la semana 6. Los cursos que superan las 10 semanas sufren una caída del 40% en retención.</p>
        </InsightItem>

        <InsightItem title="Liderazgo en Tecnología" type="positive">
          <p>El segmento de <strong>Data Science</strong> lidera la tasa de completación con un 88%, superando al promedio histórico.</p>
        </InsightItem>

        <div className="mt-6 border-t pt-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Nube de Conceptos Clave</h4>
            <div className="flex flex-wrap justify-center gap-2 text-center items-center">
                <span className="text-coursera-blue font-bold text-lg">Flexibilidad</span>
                <span className="text-gray-400 text-xs">Precio</span>
                <span className="text-coursera-accent font-semibold text-sm">Certificación</span>
                <span className="text-red-400 text-xs">Audio</span>
                <span className="text-gray-600 text-sm">Python</span>
                <span className="text-coursera-blue font-bold text-xl">Calidad</span>
                <span className="text-gray-400 text-xs">Tiempo</span>
                <span className="text-green-600 text-sm">Mentores</span>
            </div>
        </div>
      </div>
    </div>
  );
};
