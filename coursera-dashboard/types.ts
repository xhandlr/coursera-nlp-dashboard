export interface MetricData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ReviewGrowthData {
  month: string;
  reviews: number;
  growth: number;
}

export interface ScatterData {
  x: number; // Price or Duration
  y: number; // Rating or Enrolled
  z?: number; // Size (e.g., completion rate)
  name: string;
  category?: string;
}

export interface InstitutionRank {
  name: string;
  rating: number;
  change: number;
}

export interface RadarData {
  subject: string;
  A: number; // Coursera
  B: number; // Market Avg
  fullMark: number;
}

export interface TreemapNode {
  name: string;
  size: number; // Students
  fill?: string;
}

export interface WordCloudItem {
  text: string;
  value: number; // Determines size
  color?: string;
}

export enum ChartType {
  BAR = 'BAR',
  LINE = 'LINE',
  SCATTER = 'SCATTER',
  RADAR = 'RADAR',
  TREEMAP = 'TREEMAP'
}