import React from 'react';
import topicsSummary from '../data/topics_summary.json';

// Define la estructura de una palabra para la nube
interface Word {
  text: string;
  value: number;
}

// Define la estructura de un tópico, incluyendo las palabras procesadas
interface Topic {
  topic_id: number;
  keywords: string;
  topic_name: string;
  words: Word[];
}

// Función para procesar el string de keywords y convertirlo en un array de objetos Word
const parseKeywords = (keywordsString: string): Word[] => {
  if (!keywordsString) return [];
  return keywordsString.split(' + ').map(part => {
    const [value, text] = part.split('*');
    return {
      text: text.replace(/"/g, ''), // Limpiar comillas
      value: parseFloat(value)
    };
  });
};

// Paletas de colores para cada nube de palabras
const colorPalettes = [
  ['#0056D2', '#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9'], 
  ['#362e7dff', '#5643a0ff', '#8266bbff', '#9181c7ff', '#b4a5d6ff'], 
  ['#0068e6ff', '#0082fbff', '#4db5ffff', '#80b9ffff', '#b2dfffff']  
];

export const WordCloud: React.FC = () => {
  // Procesar los datos del JSON para añadir las palabras parseadas
  const topics: Topic[] = topicsSummary.map(topic => ({
    ...topic,
    words: parseKeywords(topic.keywords)
  }));

  return (
    <div className="relative w-full overflow-hidden py-16 bg-gradient-to-b from-white to-slate-50/50 border-t border-slate-200">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tópicos Clave en Reseñas Negativas</h2>
        <p className="text-slate-500 font-medium mt-2">Análisis de sentimiento sobre las principales áreas de mejora.</p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col items-center gap-y-16 px-6">
        {topics.map((topic, topicIndex) => (
          <div key={topic.topic_id} className="w-full p-8 border border-slate-200/80 rounded-2xl bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-slate-700 mb-8 text-center">{topic.topic_name}</h3>
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
              {topic.words.map((word, wordIndex) => {
                const fontSize = `${Math.max(0.9, word.value * 150)}rem`; // Ajustar multiplicador para el tamaño
                const opacity = Math.min(1, Math.max(0.65, word.value * 20));
                const delay = `${Math.random() * 5}s`;
                const color = colorPalettes[topicIndex % colorPalettes.length][wordIndex % colorPalettes[topicIndex % colorPalettes.length].length];

                return (
                  <span 
                    key={wordIndex}
                    className="font-bold cursor-default transition-all duration-300 hover:scale-110 animate-float select-none"
                    style={{ 
                      fontSize: fontSize, 
                      color: color,
                      opacity: opacity,
                      animationDelay: delay,
                      textShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};