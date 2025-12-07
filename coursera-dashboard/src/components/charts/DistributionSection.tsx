import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '../Card';
import { COLORS } from '../../utils/constants';
import languageDistributionData from '../../data/language_distribution.json';
import courseraMetrics from '../../data/category_coursera_metrics.json';

// --- Helper para dar formato al tooltip del gráfico de pastel ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
        <p className="font-bold text-slate-800">{`${payload[0].name}`}</p>
        <p className="text-sm text-slate-600">Total: {payload[0].value.toLocaleString()}</p>
        <p className="text-sm text-blue-600 font-semibold">{`(${(payload[0].percent * 100).toFixed(2)}%)`}</p>
      </div>
    );
  }
  return null;
};

// --- Helper para tooltip de categorías con porcentajes calculados ---
const CategoryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const categoryName = data.name;
    const totalValue = payload[0].value;
    const percentage = data.percentage || 0;
    
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
        <p className="font-bold text-slate-800">{categoryName}</p>
        <p className="text-sm text-slate-600">Cursos: {totalValue.toLocaleString()}</p>
        <p className="text-sm text-blue-600 font-semibold">{percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

// --- Helper para tooltip de idiomas con nombres completos ---
const LanguageTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const languageNames: { [key: string]: string } = {
      'EN': 'Inglés',
      'ES': 'Español',
      'FR': 'Francés',
      'RU': 'Ruso',
      'PT': 'Portugués',
      'DE': 'Alemán',
      'IT': 'Italiano',
      'ZH': 'Chino',
      'JA': 'Japonés',
      'SO': 'Somalí',
      'NO': 'Noruego',
      'AF': 'Afrikáans',
      'Otros': 'Otros idiomas'
    };
    
    const data = payload[0].payload;
    const languageCode = data.name;
    const fullName = languageNames[languageCode] || languageCode;
    
    // Calcular porcentaje manualmente desde los datos
    const totalValue = payload[0].value;
    const percentage = data.percentage || 0;
    
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100">
        <p className="font-bold text-slate-800">{fullName} ({languageCode})</p>
        <p className="text-sm text-slate-600">Reseñas: {totalValue.toLocaleString()}</p>
        <p className="text-sm text-blue-600 font-semibold">{percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

// --- Gráfico 1: Distribución de Cursos por Categoría ---
const CategoryDistributionChart: React.FC = () => {
  // Procesar los datos de Coursera para mostrar la distribución de cursos
  const filteredMetrics = courseraMetrics.filter(metric => metric.course_metrics.total_courses > 0);
  
  // Calcular total para porcentajes
  const totalCourses = filteredMetrics.reduce((acc, metric) => acc + metric.course_metrics.total_courses, 0);
  
  const categoryData = filteredMetrics
    .map(metric => ({
      name: metric.category_name,
      value: metric.course_metrics.total_courses,
      percentage: (metric.course_metrics.total_courses / totalCourses) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Colores específicos para cada categoría
  const categoryColors: { [key: string]: string } = {
    'AI': '#1e40af', // Azul fuerte para AI
    'DataScience': '#dc2626', // Rojo para Data Science
    'Technology': '#059669', // Verde para Technology
    'Health': '#7c3aed', // Púrpura para Health
    'Finance': '#ea580c', // Naranja para Finance
    'Design': '#be123c', // Rosa para Design
    'Math and Logic': '#ca8a04', // Amarillo para Math
    'Social Sciences': '#0891b2', // Cian para Social Sciences
    'Others': '#6b7280'  // Gris para otros
  };

  return (
    <Card title="Distribución de Cursos en Coursera" subtitle="Porcentaje de cursos por categoría en la plataforma">
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70} // Convertido a gráfico de dona
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={3}
            >
              {categoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={categoryColors[entry.name] || COLORS.chartPalette[index % COLORS.chartPalette.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CategoryTooltip />} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// --- Gráfico 2: Distribución de Idiomas en Reseñas ---
const LanguageDistributionChart: React.FC = () => {
  // Procesar datos para Top 5 + "Otros"
  const sortedLanguages = [...languageDistributionData].sort((a, b) => b.total_reviews - a.total_reviews);
  const top5 = sortedLanguages.slice(0, 5);
  const othersCount = sortedLanguages.slice(5).reduce((acc, lang) => acc + lang.total_reviews, 0);

  // Calcular total para porcentajes
  const totalReviews = languageDistributionData.reduce((acc, lang) => acc + lang.total_reviews, 0);

  const languageData = top5.map(lang => ({
    name: lang.language.toUpperCase(),
    value: lang.total_reviews,
    percentage: (lang.total_reviews / totalReviews) * 100
  }));

  if (othersCount > 0) {
    languageData.push({ 
      name: 'Otros', 
      value: othersCount,
      percentage: (othersCount / totalReviews) * 100
    });
  }

  // Colores específicos para idiomas principales
  const languageColors: { [key: string]: string } = {
    'EN': '#1e40af', // Azul fuerte para inglés
    'ES': '#dc2626', // Rojo para español
    'FR': '#7c3aed', // Púrpura para francés
    'RU': '#059669', // Verde para ruso
    'PT': '#ea580c', // Naranja para portugués
    'DE': '#4f46e5', // Índigo para alemán
    'IT': '#be123c', // Rosa para italiano
    'ZH': '#ca8a04', // Amarillo para chino
    'JA': '#0891b2', // Cian para japonés
    'SO': '#f59e0b', // Amarillo para somalí
    'NO': '#8b5cf6', // Violeta para noruego
    'AF': '#10b981', // Verde esmeralda para afrikáans
    'Otros': '#6b7280'  // Gris para otros
  };

  return (
    <Card title="Distribución de Idiomas" subtitle="Top 5 idiomas en reseñas negativas">
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={languageData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={3}
            >
              {languageData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={languageColors[entry.name] || COLORS.chartPalette[index % COLORS.chartPalette.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<LanguageTooltip />} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};


// --- Componente Principal de la Sección ---
export const DistributionSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CategoryDistributionChart />
      <LanguageDistributionChart />
    </div>
  );
};