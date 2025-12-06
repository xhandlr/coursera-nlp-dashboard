import React from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend 
} from 'recharts';
import { Card } from '../Card';
import { priceRatingData, durationEnrolledData, radarData, COLORS } from '@/utils/constants';

const CustomTooltipPrice = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur p-3 shadow-xl rounded-xl border border-blue-50">
        <p className="font-bold text-blue-700 mb-1 text-sm">{data.name}</p>
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
  return (
    <Card title="Calidad vs Precio" subtitle="Análisis de dispersión (KPI 4)">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="x" name="Precio" unit="$" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis type="number" dataKey="y" name="Rating" domain={[3.5, 5]} tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipPrice />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Cursos" data={priceRatingData} fill={COLORS.accent} shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const CustomTooltipDuration = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur p-4 shadow-xl rounded-xl border border-blue-50 max-w-[200px]">
        <p className="font-bold text-blue-800 text-sm mb-2">{data.name}</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between"><span>Duración:</span> <span className="font-bold">{data.x} sem</span></div>
          <div className="flex justify-between"><span>Inscritos:</span> <span className="font-bold">{data.y}k</span></div>
          <div className="flex justify-between"><span>Completación:</span> <span className="font-bold text-green-600">{data.z}%</span></div>
        </div>
        {data.x > 10 && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-red-500 text-xs italic flex items-center gap-1">
            <span>📉</span> Riesgo de abandono
          </div>
        )}
      </div>
    );
  }
  return null;
};

// KPI 5: Duration vs Enrolled (Bubble)
export const DurationVsEnrolled: React.FC = () => {
  return (
    <Card title="Retención vs Duración" subtitle="¿Cuándo abandonan? (KPI 5)">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="x" name="Semanas" unit="w" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis type="number" dataKey="y" name="Inscritos" unit="k" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Completación" />
            <Tooltip content={<CustomTooltipDuration />} />
            <Scatter name="Cursos" data={durationEnrolledData} fill={COLORS.primary} fillOpacity={0.6} stroke={COLORS.primary} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// KPI 6: Radar Competitor Analysis
export const MarketRadar: React.FC = () => {
  return (
    <Card title="Benchmarking Competitivo" subtitle="Coursera (Azul) vs Mercado (Gris)">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar name="Coursera" dataKey="A" stroke={COLORS.primary} strokeWidth={3} fill={COLORS.primary} fillOpacity={0.3} />
            <Radar name="Mercado" dataKey="B" stroke="#94A3B8" strokeWidth={2} fill="#94A3B8" fillOpacity={0.1} strokeDasharray="4 4" />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};