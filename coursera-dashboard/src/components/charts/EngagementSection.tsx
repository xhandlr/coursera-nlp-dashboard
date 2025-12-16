import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ComposedChart, Line, CartesianGrid, Legend, LineChart, Area
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

  // Calcular insight
  const topCategory = categoryGlobalMetrics.reduce((prev, current) =>
    prev.average_completion > current.average_completion ? prev : current
  );
  const avgCompletion = categoryGlobalMetrics.reduce((sum, cat) => sum + cat.average_completion, 0) / categoryGlobalMetrics.length;

  // Comparación de cursos
  const sortedByCourses = [...categoryGlobalMetrics].sort((a, b) => b.total_courses - a.total_courses);
  const avgCourses = categoryGlobalMetrics.reduce((sum, cat) => sum + cat.total_courses, 0) / categoryGlobalMetrics.length;
  const rankingCourses = sortedByCourses.findIndex(cat => cat.category_name === topCategory.category_name) + 1;

  // Comparación de precio
  const avgPrice = categoryGlobalMetrics.reduce((sum, cat) => sum + cat.average_price, 0) / categoryGlobalMetrics.length;

  const insightAnswer = (
    <div className="space-y-3">
      <p className="font-semibold text-blue-700">🏆 Mejor categoría: {topCategory.category_name}</p>
      <div className="space-y-2">
        <p>• <span className="font-medium">Tasa de completación:</span> {topCategory.average_completion.toFixed(2)}%</p>
        <p>• <span className="font-medium">Total de cursos:</span> {topCategory.total_courses.toLocaleString()}</p>
        <p>• <span className="font-medium">Inscritos:</span> {topCategory.total_enrollment.toLocaleString()}</p>
        <p>• <span className="font-medium">Rating promedio:</span> {topCategory.average_rating.toFixed(1)}/5.0 ⭐</p>
      </div>
      <div className="pt-2 border-t border-blue-200">
        <p className="font-medium text-gray-800 mb-1">📊 Comparativa:</p>
        <p>• Promedio general: {avgCompletion.toFixed(2)}%</p>
        <p>• Diferencia: <span className="text-green-600 font-semibold">+{(topCategory.average_completion - avgCompletion).toFixed(2)} puntos porcentuales</span></p>
      </div>
      <div className="pt-2 border-t border-blue-200">
        <p className="font-medium text-gray-800 mb-1">🔍 Características diferenciadoras:</p>
        <p>• Catálogo: {topCategory.total_courses.toLocaleString()} cursos (puesto #{rankingCourses} de {categoryGlobalMetrics.length}, {((topCategory.total_courses / avgCourses) * 100 - 100).toFixed(0)}% {topCategory.total_courses > avgCourses ? 'por encima' : 'por debajo'} del promedio)</p>
        <p>• Rating de {topCategory.average_rating.toFixed(1)}/5.0 (alto engagement)</p>
        <p>• Precio ${topCategory.average_price.toFixed(2)} ({topCategory.average_price < avgPrice ? 'más accesible' : 'por encima'} del promedio: ${avgPrice.toFixed(2)})</p>
      </div>
    </div>
  );

  return (
    <Card
      title="Tasa de Completación Global"
      subtitle="Ranking por temática (todas las plataformas)"
      insight={{
        question: "¿Qué categoría tiene la mejor tasa de completación en Coursera y qué características la diferencian del resto?",
        answer: insightAnswer
      }}
    >
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
              {completionData.map((_, index) => (
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

  // Calcular estadísticas
  const avgRating = top5Institutions.reduce((sum, inst) => sum + inst.average_rating, 0) / top5Institutions.length;
  const avgReviews = top5Institutions.reduce((sum, inst) => sum + inst.total_reviews, 0) / top5Institutions.length;
  const avgCourses = top5Institutions.reduce((sum, inst) => sum + inst.total_courses, 0) / top5Institutions.length;

  const insightAnswer = (
    <div className="space-y-3">
      <p className="font-semibold text-blue-700">🏆 Top 5 Instituciones Líderes</p>
      <div className="space-y-2">
        {top5Institutions.map((inst, idx) => (
          <div key={idx} className="pl-2 border-l-2 border-blue-300">
            <p className="font-medium">{idx + 1}. {inst.institution_name}</p>
            <p className="text-xs text-gray-600">Rating: {inst.average_rating}/5.0 | {inst.total_reviews.toLocaleString()} reseñas | {inst.total_courses} cursos</p>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-blue-200">
        <p className="font-medium text-gray-800 mb-1">🔍 Características comunes:</p>
        <p>• <span className="font-medium">Rating promedio:</span> {avgRating.toFixed(2)}/5.0 ⭐</p>
        <p>• <span className="font-medium">Promedio de reseñas:</span> {avgReviews.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
        <p>• <span className="font-medium">Promedio de cursos:</span> {avgCourses.toFixed(1)}</p>
        <p>• <span className="font-medium">Engagement verificado:</span> {(avgReviews / avgCourses).toLocaleString('en-US', { maximumFractionDigits: 0 })} reseñas/curso</p>
      </div>
      <div className="pt-2 border-t border-blue-200">
        <p className="font-medium text-gray-800 mb-1">💡 Especialización temática:</p>
        <p>• Predominan universidades de élite (Stanford, Yale, Hebrew)</p>
        <p>• Fuerte enfoque en tecnología (DeepLearning.AI)</p>
        <p>• Excelente ratio de participación: 4,382 reseñas/curso</p>
      </div>
    </div>
  );

  return (
    <Card
      title="Líderes en Prestigio"
      subtitle="Top 5 instituciones por score (KPI 2)"
      insight={{
        question: "¿Qué instituciones lideran el índice de satisfacción y cuáles son sus características comunes en términos de cantidad de cursos, reviews y especialización temática?",
        answer: insightAnswer
      }}
    >
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

// Custom Tooltip para Tasa de Crecimiento de Reseñas
const CustomTooltipReviewGrowth = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const growthRate = data.growth_rate;
    const isPositive = growthRate >= 0;

    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-blue-50">
        <p className="font-bold text-gray-800 mb-1">Año {label}</p>
        <p className="text-slate-600 text-sm font-semibold">Reseñas: {data.total_reviews.toLocaleString()}</p>
        {data.previous_year_reviews !== null && (
          <>
            <p className="text-slate-500 text-xs">Año anterior: {data.previous_year_reviews.toLocaleString()}</p>
            <p className={`text-sm font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              Crecimiento: {isPositive ? '+' : ''}{growthRate}%
            </p>
          </>
        )}
        {data.previous_year_reviews === null && (
          <p className="text-slate-500 text-xs italic">Primer año (sin comparativa)</p>
        )}
      </div>
    );
  }
  return null;
};

// KPI 5: Tasa de Crecimiento de Reseñas
export const EngagementGrowthChart: React.FC = () => {
  // Datos de crecimiento de reseñas año a año
  const growthData = reviewTrends.review_growth || [];

  // Preparar datos para el gráfico
  const chartData = growthData.map(item => ({
    year: item.year.toString(),
    growth_rate: item.growth_rate || 0,
    total_reviews: item.total_reviews,
    previous_year_reviews: item.previous_year_reviews
  }));

  // Calcular estadísticas para el insight
  const growthRates = growthData.filter(d => d.growth_rate !== null).map(d => d.growth_rate);
  const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  const maxGrowth = Math.max(...growthRates);
  const minGrowth = Math.min(...growthRates);
  const total2015 = growthData[0]?.total_reviews || 0;
  const total2020 = growthData[growthData.length - 1]?.total_reviews || 0;
  const totalGrowth = ((total2020 - total2015) / total2015) * 100;

  const insightAnswer = (
    <div className="space-y-3">
      <p className="font-semibold text-blue-700">📊 Crecimiento año a año:</p>
      <div className="space-y-1">
        {growthData.map((item, idx) => (
          <p key={idx}>
            • <span className="font-medium">{item.year}:</span> {item.total_reviews.toLocaleString()} reseñas
            {item.growth_rate !== null && (
              <span className={item.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}>
                {' '}({item.growth_rate >= 0 ? '+' : ''}{item.growth_rate}%)
              </span>
            )}
          </p>
        ))}
      </div>
      <div className="pt-2 border-t border-blue-200">
        <p className="font-medium text-gray-800 mb-1">🔍 Análisis de tendencias:</p>
        <p>• <span className="font-medium">Crecimiento promedio:</span> {avgGrowth.toFixed(2)}%</p>
        <p>• <span className="font-medium">Mayor crecimiento:</span> <span className="text-green-600">+{maxGrowth}%</span> (2016 y 2020)</p>
        <p>• <span className="font-medium">Menor crecimiento:</span> <span className="text-orange-600">{minGrowth}%</span> (2018)</p>
      </div>
      <div className="pt-2 border-t border-blue-200">
        <p className="font-medium text-gray-800 mb-1">💡 Patrones identificados:</p>
        <p>• <span className="text-green-600 font-semibold">Crecimiento explosivo en 2020</span> (+218.79%)</p>
        <p>• Posible causa: Pandemia COVID-19 impulsó educación online</p>
        <p>• Crecimiento total 2015-2020: <span className="font-semibold">+{totalGrowth.toFixed(0)}%</span></p>
        <p>• Factor de multiplicación: <span className="font-semibold">{(total2020 / total2015).toFixed(1)}x</span></p>
      </div>
    </div>
  );

  return (
    <Card
      title="Tasa de Crecimiento de Reseñas"
      subtitle="Variación porcentual año a año del volumen de reseñas"
      insight={{
        question: "¿Cuál es la tendencia de crecimiento de reseñas en Coursera durante los últimos años y existen patrones estacionales o picos significativos?",
        answer: insightAnswer
      }}
    >
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 13, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 13, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Crecimiento (%)', angle: -90, position: 'insideLeft', style: { fill: '#94A3B8', fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltipReviewGrowth />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

            {/* Área de fondo para valores positivos */}
            <Area
              type="monotone"
              dataKey="growth_rate"
              name="Tasa de Crecimiento"
              fill="#10B981"
              fillOpacity={0.2}
              stroke="none"
            />

            {/* Barras coloreadas según crecimiento positivo/negativo */}
            <Bar
              dataKey="growth_rate"
              name="Tasa de Crecimiento (%)"
              barSize={50}
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.growth_rate >= 0 ? '#10B981' : '#EF4444'}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>

            {/* Línea de tendencia */}
            <Line
              type="monotone"
              dataKey="growth_rate"
              stroke="#0056D2"
              strokeWidth={3}
              dot={{ r: 6, fill: '#FFFFFF', strokeWidth: 3, stroke: '#0056D2' }}
              activeDot={{ r: 8 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen estadístico */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Crecimiento Promedio</p>
            <p className="text-lg font-bold text-gray-800">
              {(growthData
                .filter(d => d.growth_rate !== null)
                .reduce((sum, d) => sum + (d.growth_rate || 0), 0) /
                growthData.filter(d => d.growth_rate !== null).length
              ).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Mayor Crecimiento</p>
            <p className="text-lg font-bold text-green-600">
              +{Math.max(...growthData.filter(d => d.growth_rate !== null).map(d => d.growth_rate || 0)).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Menor Crecimiento</p>
            <p className="text-lg font-bold text-red-600">
              {Math.min(...growthData.filter(d => d.growth_rate !== null).map(d => d.growth_rate || 0)).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};