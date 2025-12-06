import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '../Card';
import { distributionData, COLORS } from '@/utils/constants';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 backdrop-blur p-4 border-none shadow-xl rounded-2xl text-sm">
        <p className="font-bold text-gray-800 mb-1">{data.name}</p>
        <p className="text-blue-600 font-semibold">{data.value}% de estudiantes</p>
      </div>
    );
  }
  return null;
};

// KPI 8: Distribution Donut Chart
export const CategoryDonut: React.FC = () => {
  return (
    <Card title="Distribución de Catálogo" subtitle="¿Qué están aprendiendo los estudiantes?" className="h-full">
      <div className="h-96 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distributionData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={8}
            >
              {distributionData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  style={{ filter: `drop-shadow(0px 4px 6px ${entry.fill}40)` }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="middle" 
              align="right"
              layout="vertical"
              iconType="circle"
              wrapperStyle={{ paddingLeft: '20px', fontSize: '14px', color: '#64748B' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};