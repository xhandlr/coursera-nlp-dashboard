import { RadarData, ReviewGrowthData, ScatterData, TreemapNode, InstitutionRank, WordCloudItem } from './types';

// Coursera & Celestial Palette
export const COLORS = {
  primary: '#0056D2', // Coursera Blue
  secondary: '#382D8B', 
  accent: '#2A73CC', 
  celestialLight: '#E3F2FD', // Very light blue for backgrounds
  celestialDark: '#1E3A8A', // Deep blue
  success: '#059669', 
  warning: '#D97706',
  background: '#FFFFFF',
  white: '#FFFFFF',
  textMain: '#1e293b',
  textLight: '#64748B',
  chartPalette: ['#0056D2', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DAEFFF']
};

// Word Cloud Data (Menti Style)
export const wordCloudData: WordCloudItem[] = [
  { text: 'Calidad', value: 10, color: '#0056D2' },
  { text: 'Flexibilidad', value: 9, color: '#2A73CC' },
  { text: 'Python', value: 8, color: '#3B82F6' },
  { text: 'Certificación', value: 8, color: '#1D4ED8' },
  { text: 'Prestigio', value: 7, color: '#60A5FA' },
  { text: 'Networking', value: 6, color: '#93C5FD' },
  { text: 'Upskilling', value: 6, color: '#2563EB' },
  { text: 'Mentores', value: 5, color: '#1E40AF' },
  { text: 'Comunidad', value: 5, color: '#3B82F6' },
  { text: 'Audio', value: 4, color: '#EF4444' }, // Negative insight
  { text: 'Innovación', value: 7, color: '#0056D2' },
  { text: 'Data Science', value: 8, color: '#1E3A8A' },
  { text: 'Accesible', value: 6, color: '#60A5FA' },
  { text: 'Práctico', value: 5, color: '#93C5FD' },
  { text: 'Actualizado', value: 4, color: '#2563EB' },
  { text: 'Soporte', value: 3, color: '#94A3B8' },
  { text: 'Carrera', value: 7, color: '#1D4ED8' },
];

// KPI 1: Completion by Topic
export const completionData = [
  { name: 'Data Science', value: 88 },
  { name: 'Business', value: 76 },
  { name: 'Comp. Sci.', value: 72 },
  { name: 'Health', value: 65 },
  { name: 'Arts', value: 58 },
];

// KPI 2: Institution Leaderboard
export const institutionRankings: InstitutionRank[] = [
  { name: 'Yale University', rating: 4.9, change: 0.2 },
  { name: 'Univ. of Michigan', rating: 4.8, change: 0.1 },
  { name: 'IBM Skills Network', rating: 4.8, change: 0.0 },
  { name: 'Google', rating: 4.7, change: 0.3 },
  { name: 'Stanford', rating: 4.7, change: -0.1 },
];

// KPI 3 & 7: Reviews vs Growth
export const growthData: ReviewGrowthData[] = [
  { month: 'Ene', reviews: 4000, growth: 5 },
  { month: 'Feb', reviews: 4500, growth: 7 },
  { month: 'Mar', reviews: 4200, growth: 4 },
  { month: 'Abr', reviews: 5100, growth: 12 },
  { month: 'May', reviews: 5800, growth: 15 },
  { month: 'Jun', reviews: 6500, growth: 18 },
];

// KPI 4: Price vs Rating (Scatter)
export const priceRatingData: ScatterData[] = [
  { x: 0, y: 4.2, name: 'Free Intro' },
  { x: 29, y: 4.5, name: 'Basic Cert' },
  { x: 39, y: 4.3, name: 'Specialization A' },
  { x: 49, y: 4.6, name: 'Specialization B' },
  { x: 59, y: 4.8, name: 'Prof. Cert' },
  { x: 79, y: 4.9, name: 'MasterTrack' },
  { x: 19, y: 3.8, name: 'Short Course' },
  { x: 99, y: 4.7, name: 'Bootcamp' },
];

// KPI 5: Duration vs Enrolled (Bubble)
export const durationEnrolledData: ScatterData[] = [
  { x: 4, y: 150, z: 80, name: 'Intro to AI' },
  { x: 6, y: 120, z: 75, name: 'Python Basics' },
  { x: 8, y: 90, z: 60, name: 'Project Mgmt' },
  { x: 12, y: 40, z: 45, name: 'Full Stack' },
  { x: 16, y: 25, z: 30, name: 'Advanced ML' },
  { x: 3, y: 200, z: 85, name: 'Design Thinking' },
];

// KPI 6: Radar (Coursera vs Market)
export const radarData: RadarData[] = [
  { subject: 'Precio', A: 120, B: 110, fullMark: 150 },
  { subject: 'Rating', A: 98, B: 85, fullMark: 150 },
  { subject: 'Completación', A: 86, B: 65, fullMark: 150 },
  { subject: 'Soporte', A: 99, B: 70, fullMark: 150 },
  { subject: 'Empleabilidad', A: 85, B: 90, fullMark: 150 },
  { subject: 'Contenido', A: 95, B: 80, fullMark: 150 },
];

// KPI 8: Distribution Data (Reformatted for Pie/Donut)
export const distributionData = [
  { name: 'Tecnología', value: 35, fill: '#0056D2' },
  { name: 'Negocios', value: 25, fill: '#2A73CC' },
  { name: 'Data Science', value: 20, fill: '#3B82F6' },
  { name: 'Salud', value: 10, fill: '#60A5FA' },
  { name: 'Artes', value: 5, fill: '#93C5FD' },
  { name: 'Sociales', value: 5, fill: '#BFDBFE' },
];