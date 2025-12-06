import React from 'react';
import { Header } from './components/Header';
import { KPIScorecard } from './components/KPIScorecard';
import { WordCloud } from './components/WordCloud';
import { CompletionChart, SatisfactionTable, GrowthChart } from './components/charts/EngagementSection';
import { PriceVsRating, DurationVsEnrolled, MarketRadar } from './components/charts/MarketSection';
import { CategoryDonut } from './components/charts/DistributionSection';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Header />

      {/* Increased max-width and padding for better margins */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 pt-12 pb-0">
        
        {/* ROW 1: KPIs Cards (Floating Big Numbers) */}
        <section className="mb-20">
            {/* Increased gap from 6 to 8/10 for breathing room */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
               <KPIScorecard label="Inscritos Totales" value="1.2M" trend="12%" isPositive={true} />
               <KPIScorecard label="Rating Global" value="4.8" trend="0.2" isPositive={true} />
               <KPIScorecard label="Completación" value="68%" trend="5%" isPositive={false} />
               <KPIScorecard label="Cursos Activos" value="342" trend="8" isPositive={true} />
            </div>
        </section>

        {/* SECTION A: ENGAGEMENT (Soft Blue Background) */}
        <section className="mb-20 rounded-[3rem] bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 p-10 lg:p-16 shadow-[0_20px_50px_-20px_rgba(0,86,210,0.05)]">
            <div className="flex flex-col mb-12">
                <h2 className="text-3xl font-extrabold text-[#0056D2] tracking-tight">Calidad & Engagement</h2>
                <p className="text-slate-500 font-medium mt-1">Métricas de satisfacción y crecimiento estudiantil</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                 <CompletionChart />
                 <SatisfactionTable />
            </div>
            <div className="mt-12 lg:mt-16">
                 <GrowthChart />
            </div>
        </section>

        {/* SECTION B: MARKET ANALYSIS (White/Clean) */}
        <section className="mb-20 px-4 lg:px-8">
             <div className="flex flex-col mb-12 pl-6 border-l-4 border-[#0056D2]">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Análisis de Mercado</h2>
                <p className="text-slate-500 font-medium mt-1">Correlaciones de precio, duración y competencia</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                <PriceVsRating />
                <DurationVsEnrolled />
            </div>
            <div className="mt-12 lg:mt-16">
                <MarketRadar />
            </div>
        </section>

        {/* SECTION C: DISTRIBUTION (Soft Accent Background) */}
        <section className="mb-0 rounded-t-[3rem] bg-gradient-to-b from-[#F0F7FF] to-[#E3F2FD]/30 p-10 lg:p-16 pb-32">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-[#0056D2] tracking-tight">Distribución del Catálogo</h2>
                <p className="text-slate-500 font-medium mt-1">Segmentación por temáticas principales</p>
            </div>
            
            <div className="max-w-5xl mx-auto h-[550px]">
                <CategoryDonut />
            </div>
        </section>

      </main>

      {/* FINAL SECTION: WORD CLOUD (Footer/Atmospheric) */}
      <WordCloud />
      
    </div>
  );
};

export default App;