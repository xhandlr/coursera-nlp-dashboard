import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  ComposedChart, Line, CartesianGrid, Legend, LineChart, Area, AreaChart
} from 'recharts';
import { Star } from 'lucide-react';
import { Card } from '../Card';
import { COLORS } from '../../utils/constants';
import categoryGlobalMetrics from '../../data/category_global_metrics.json';
import institutionMetrics from '../../data/top_10_institution_metrics.json';
import reviewTrends from '../../data/review_trends.json';

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
  // Procesar y ordenar los datos del JSON importado
  const completionData = categoryGlobalMetrics
    .map(category => ({
      name: category.category_name,
      value: category.average_completion,
    }))
    .sort((a, b) => b.value - a.value);

  // Encontrar el valor mínimo para ajustar el dominio del gráfico y exagerar las diferencias
  const minDataValue = Math.min(...completionData.map(d => d.value));
  const maxDataValue = Math.max(...completionData.map(d => d.value));
  // Establecer el dominio para hacer "zoom", por ejemplo, desde 5 puntos porcentuales por debajo del mínimo
  const chartDomain: [number, number] = [Math.max(0, Math.floor(minDataValue - 5)), Math.ceil(maxDataValue + 2)];

  return (
    <Card title="Tasa de Completación Global" subtitle="Ranking por temática (todas las plataformas)">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={completionData} margin={{ left: 10, right: 30 }}>
            <XAxis type="number" domain={chartDomain} hide />
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
  // Obtener el top 5 de instituciones del JSON importado
  const top5Institutions = institutionMetrics.top_10_prestige.slice(0, 5);

  return (
    <Card title="Líderes en Prestigio" subtitle="Top 5 instituciones por score (KPI 2)">
      <div className="h-80 overflow-y-auto pr-2 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-4">Institución</th>
              <th className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-4 text-right">Rating</th>
            </tr>
          </thead>
          <tbody>
            {top5Institutions.map((inst, idx) => (
              <tr key={inst.rank} className="group hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0">
                <td className="py-4 text-base text-gray-700 flex items-center gap-3">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${idx < 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {inst.rank}
                  </span>
                  <span className="font-medium">{inst.institution_name}</span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-lg font-bold text-gray-800">
                      {inst.average_rating.toFixed(2)} 
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
      // Buscar los valores correctos por nombre de dataKey
      const positiveData = payload.find((p: any) => p.dataKey === 'positive');
      const negativeData = payload.find((p: any) => p.dataKey === 'negative');
      const satisfactionData = payload.find((p: any) => p.dataKey === 'satisfaction');
      const total = (positiveData?.value || 0) + (negativeData?.value || 0);
      
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-blue-50">
          <p className="font-bold text-gray-800 mb-1">Año {label}</p>
          <p className="text-slate-600 text-sm font-semibold">Total: {total.toLocaleString()}</p>
          {positiveData && <p className="text-green-600 text-sm">Positivas: {positiveData.value.toLocaleString()}</p>}
          {negativeData && <p className="text-red-500 text-sm">Negativas: {negativeData.value.toLocaleString()}</p>}
          {satisfactionData && <p className="text-orange-500 text-sm">Satisfacción: {satisfactionData.value.toFixed(1)}%</p>}
        </div>
      );
    }
    return null;
};

const CustomTooltipMonthly = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-blue-50">
          <p className="font-bold text-gray-800 mb-1">{monthNames[label - 1]}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
};

// KPI 3: Evolución Anual de Reseñas
export const GrowthChart: React.FC = () => {
  // Procesar datos anuales
  const yearlyData = reviewTrends.yearly_summary.map(item => ({
    year: item.year.toString(),
    total: item.total_reviews,
    positive: item.positive,
    negative: item.negative,
    satisfaction: ((item.positive / item.total_reviews) * 100)
  }));

  return (
    <Card title="Evolución Anual de Reseñas" subtitle="Distribución de reseñas positivas, negativas y tasa de satisfacción">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={yearlyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="year" tick={{ fontSize: 13, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 13, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 13, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[85, 100]} />
            <Tooltip content={<CustomTooltipGrowth />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            <Bar yAxisId="left" dataKey="positive" name="Reseñas Positivas" fill="#0056D2" barSize={40} radius={[8, 8, 0, 0]} fillOpacity={0.9} />
            <Bar yAxisId="left" dataKey="negative" name="Reseñas Negativas" fill="#EF4444" barSize={40} radius={[8, 8, 0, 0]} fillOpacity={0.9} />
            <Line yAxisId="right" type="monotone" dataKey="satisfaction" name="% Satisfacción" stroke={COLORS.warning} strokeWidth={4} dot={{ r: 6, fill: COLORS.white, strokeWidth: 3, stroke: COLORS.warning }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// KPI 4: Evolución Mensual de Reseñas Negativas
export const MonthlyNegativeChart: React.FC = () => {
  // Agrupar datos mensuales por año
  const monthlyData: any = {};
  
  reviewTrends.monthly_negative_evolution.forEach(item => {
    if (!monthlyData[item.month]) {
      monthlyData[item.month] = { month: item.month };
    }
    monthlyData[item.month][`year_${item.year}`] = item.total_negative_reviews;
  });

  const monthlyChartData = Object.values(monthlyData).sort((a: any, b: any) => a.month - b.month);
  
  // Obtener años únicos para las líneas
  const years = [...new Set(reviewTrends.monthly_negative_evolution.map(item => item.year))];
  const yearColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <Card title="Evolución Mensual de Reseñas Negativas" subtitle="Comparativa de reseñas negativas por mes a través de los años">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 13, fill: '#94A3B8' }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][value - 1]}
              dy={10}
            />
            <YAxis tick={{ fontSize: 13, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipMonthly />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
            {years.map((year, index) => (
              <Line 
                key={year}
                type="monotone" 
                dataKey={`year_${year}`} 
                name={year.toString()}
                stroke={yearColors[index % yearColors.length]} 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};