import React from 'react';
import { Header } from './components/Header';
import CourseraDashboard from './pages/CourseraDashboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Header />
      <CourseraDashboard />
    </div>
  );
};

export default App;