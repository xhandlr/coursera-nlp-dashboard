import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  ComposedChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { Star } from 'lucide-react';
import { Card } from '../Card';
import { completionData, institutionRankings, growthData, COLORS } from '../../constants';

// Tooltip components
const CustomTooltipCompletion = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-blue-50">
          <p className="font-bold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-blue-600 font-semibold">{payload[0].value}% completado</p>
        </div>
      );
    }
    return null;
};

// KPI 1: Completion Rate
export const CompletionChart: React.FC = () => {
  return (
    <Card title="Tasa de Completación" subtitle="Ranking por temática (KPI 1)">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={completionData} margin={{ left: 10, right: 30 }}>
            <XAxis type="number" hide />
            <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fontSize: 13, fill: '#64748B', fontWeight: 500 }} 
                axisLine={false}
                tickLine={false}
            />
            <Tooltip cursor={{ fill: '#F1F5F9', radius: 8 }} content={<CustomTooltipCompletion />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
              {completionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.chartPalette[index % COLORS.chartPalette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// KPI 2: Satisfaction Leaderboard
export const SatisfactionTable: React.FC = () => {
  return (
    <Card title="Líderes en Calidad" subtitle="Instituciones con mejor rating (KPI 2)">
      <div className="h-80 overflow-y-auto pr-2 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-4">Institución</th>
              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-4 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {institutionRankings.map((inst, idx) => (
              <tr key={idx} className="group hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0">
                <td className="py-4 text-base text-gray-700 flex items-center gap-3">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${idx < 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-medium">{inst.name}</span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-lg font-bold text-gray-800">
                      {inst.rating} 
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 ml-1" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const CustomTooltipGrowth = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-blue-50">
          <p className="font-bold text-gray-800 mb-1">{label}</p>
          <p className="text-blue-600 text-sm">Reviews: {payload[0].value}</p>
          <p className="text-orange-500 text-sm">Crecimiento: {payload[1].value}%</p>
        </div>
      );
    }
    return null;
};

// KPI 3 & 7: Growth vs Reviews
export const GrowthChart: React.FC = () => {
  return (
    <Card title="Evolución de Reviews" subtitle="Correlación entre volumen y crecimiento mensual">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={growthData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 13, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 13, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 13, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipGrowth />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            <Bar yAxisId="left" dataKey="reviews" name="Reviews Positivas" fill={COLORS.primary} barSize={40} radius={[8, 8, 0, 0]} fillOpacity={0.9} />
            <Line yAxisId="right" type="monotone" dataKey="growth" name="% Crecimiento" stroke={COLORS.warning} strokeWidth={4} dot={{ r: 6, fill: COLORS.white, strokeWidth: 3, stroke: COLORS.warning }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};