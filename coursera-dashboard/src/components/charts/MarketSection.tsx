import React from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend 
} from 'recharts';
import { Card } from '../Card';
import { COLORS } from '../../utils/constants';
import correlationData from '../../data/correlation_scatter.json';
import platformMetrics from '../../data/platform_metrics.json';

const CustomTooltipPrice = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur p-3 shadow-xl rounded-xl border border-blue-50">
        <p className="font-bold text-blue-700 mb-1 text-sm">Curso</p>
        <div className="text-xs text-gray-600">
            <p>Precio: <span className="font-semibold">${data.x}</span></p>
            <p>Rating: <span className="font-semibold">{data.y} ⭐</span></p>
        </div>
      </div>
    );
  }
  return null;
};

// KPI 4: Price vs Rating Scatter
export const PriceVsRating: React.FC = () => {
  // Usar los datos reales de correlación
  const priceRatingData = correlationData.scatter_plots.price_vs_rating.data;
  
  return (
    <Card title="Calidad vs Precio" subtitle="Análisis de dispersión (KPI 4)">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="x" name="Precio" unit="$" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis type="number" dataKey="y" name="Rating" domain={[3, 5]} tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipPrice />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Cursos" data={priceRatingData} fill={COLORS.accent} shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Correlación: {correlationData.scatter_plots.price_vs_rating.correlation.toFixed(3)} - {correlationData.scatter_plots.price_vs_rating.insight}
      </div>
    </Card>
  );
};

const CustomTooltipDuration = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur p-4 shadow-xl rounded-xl border border-blue-50 max-w-[200px]">
        <p className="font-bold text-blue-800 text-sm mb-2">Curso</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between"><span>Duración:</span> <span className="font-bold">{data.x} hrs</span></div>
          <div className="flex justify-between"><span>Inscritos:</span> <span className="font-bold">{Math.round(data.y).toLocaleString()}</span></div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltipReviews = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur p-3 shadow-xl rounded-xl border border-green-50">
        <p className="font-bold text-green-700 text-sm mb-2">Curso</p>
        <div className="text-xs text-gray-600">
          <p>Duración: <span className="font-semibold">{data[0]} hrs</span></p>
          <p>Reviews: <span className="font-semibold">{data[1].toLocaleString()}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltipLevel = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const levelNames = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };
    return (
      <div className="bg-white/95 backdrop-blur p-3 shadow-xl rounded-xl border border-purple-50">
        <p className="font-bold text-purple-700 text-sm mb-2">Curso</p>
        <div className="text-xs text-gray-600">
          <p>Nivel: <span className="font-semibold">{levelNames[data[0] as keyof typeof levelNames] || `Nivel ${data[0]}`}</span></p>
          <p>Rating: <span className="font-semibold">{data[1]} ⭐</span></p>
        </div>
      </div>
    );
  }
  return null;
};

// KPI 5: Duration vs Enrolled (Scatter)
export const DurationVsEnrolled: React.FC = () => {
  // Usar los datos reales de correlación
  const durationEnrolledData = correlationData.scatter_plots.duration_vs_enrolled.data;
  
  return (
    <Card title="Duración vs Inscritos" subtitle="¿Prefieren cursos largos o cortos? (KPI 5)">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="x" name="Duración" unit="hrs" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis type="number" dataKey="y" name="Inscritos" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipDuration />} />
            <Scatter name="Cursos" data={durationEnrolledData} fill={COLORS.primary} fillOpacity={0.6} stroke={COLORS.primary} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Correlación: {correlationData.scatter_plots.duration_vs_enrolled.correlation.toFixed(3)} - {correlationData.scatter_plots.duration_vs_enrolled.insight}
      </div>
    </Card>
  );
};

// KPI 6: Radar Competitor Analysis
export const MarketRadar: React.FC = () => {
  // Procesar datos para radar chart
  const courseraData = platformMetrics.find(p => p.platform_name === 'Coursera');
  const competitors = platformMetrics.filter(p => p.platform_name !== 'Coursera');
  
  // Calcular promedio del mercado (sin Coursera)
  const marketAvg = {
    total_courses: competitors.reduce((acc, p) => acc + p.total_courses, 0) / competitors.length,
    total_enrollment: competitors.reduce((acc, p) => acc + p.total_enrollment, 0) / competitors.length,
    average_completion: competitors.reduce((acc, p) => acc + p.average_completion, 0) / competitors.length,
    average_rating: competitors.reduce((acc, p) => acc + p.average_rating, 0) / competitors.length,
    average_price: competitors.reduce((acc, p) => acc + p.average_price, 0) / competitors.length,
  };

  // Normalizar datos para radar (escala 0-100)
  const radarBenchmark = [
    {
      metric: 'Catálogo',
      coursera: (courseraData!.total_courses / Math.max(courseraData!.total_courses, marketAvg.total_courses)) * 100,
      mercado: (marketAvg.total_courses / Math.max(courseraData!.total_courses, marketAvg.total_courses)) * 100,
    },
    {
      metric: 'Escala',
      coursera: (courseraData!.total_enrollment / Math.max(courseraData!.total_enrollment, marketAvg.total_enrollment)) * 100,
      mercado: (marketAvg.total_enrollment / Math.max(courseraData!.total_enrollment, marketAvg.total_enrollment)) * 100,
    },
    {
      metric: 'Completación',
      coursera: (courseraData!.average_completion / Math.max(courseraData!.average_completion, marketAvg.average_completion)) * 100,
      mercado: (marketAvg.average_completion / Math.max(courseraData!.average_completion, marketAvg.average_completion)) * 100,
    },
    {
      metric: 'Calidad',
      coursera: (courseraData!.average_rating / Math.max(courseraData!.average_rating, marketAvg.average_rating)) * 100,
      mercado: (marketAvg.average_rating / Math.max(courseraData!.average_rating, marketAvg.average_rating)) * 100,
    },
    {
      metric: 'Precio',
      // Para precio, invertimos (precio menor = mejor)
      coursera: ((marketAvg.average_price / courseraData!.average_price) * 100),
      mercado: 100,
    },
  ];

  return (
    <Card title="Benchmarking Competitivo" subtitle="Coursera vs Promedio del Mercado (edX, Udacity, etc.)">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarBenchmark}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false} 
              axisLine={false} 
            />
            <Radar 
              name="Coursera" 
              dataKey="coursera" 
              stroke="#1e40af" 
              strokeWidth={3} 
              fill="#1e40af" 
              fillOpacity={0.3} 
            />
            <Radar 
              name="Promedio del Mercado" 
              dataKey="mercado" 
              stroke="#94A3B8" 
              strokeWidth={2} 
              fill="#94A3B8" 
              fillOpacity={0.1} 
              strokeDasharray="4 4" 
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '14px' }} 
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
              }} 
              formatter={(value: any) => [`${value.toFixed(1)}%`, '']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-xs text-gray-500 text-center">
        Métrica normalizada: Catálogo (# cursos), Escala (inscritos), Completación (%), Calidad (rating), Precio (competitividad)
      </div>
    </Card>
  );
};