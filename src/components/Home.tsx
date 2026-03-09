import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, TrendingUp, Scissors, ArrowRight } from 'lucide-react';

const PROJECTS = [
  {
    id: 'gym-usa',
    name: 'Gym USA',
    description: 'Cold outreach tracking for gyms across the United States.',
    gid: '310390165',
    icon: <TrendingUp className="w-8 h-8 text-amber-500" />,
    color: 'amber'
  },
  {
    id: 'salon-usa',
    name: 'Salon USA',
    description: 'Cold outreach tracking for hair and beauty salons across the United States.',
    gid: '452923619',
    icon: <Scissors className="w-8 h-8 text-pink-500" />,
    color: 'pink'
  }
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <Database className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight">Antigravity CRM</h1>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-20 relative z-10">
        <div className="max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 drop-shadow-sm">Select a Project</h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Choose a lead tracking database to view the CRM dashboard. Each project reads live data directly from its connected Google Sheet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(`/crm/${project.gid}?name=${encodeURIComponent(project.name)}`)}
              className={`text-left group bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8 hover:bg-zinc-900/80 transition-all duration-300 relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full bg-${project.color}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 bg-zinc-950 rounded-xl shadow-inner border border-zinc-800 group-hover:border-${project.color}-500/30 transition-colors`}>
                  {project.icon}
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-zinc-950 border border-zinc-800 group-hover:bg-${project.color}-500 group-hover:border-${project.color}-500 transition-colors`}>
                  <ArrowRight className={`w-5 h-5 text-zinc-500 group-hover:text-zinc-950 transition-colors`} />
                </div>
              </div>
              
              <h3 className="text-2xl font-semibold mb-3 text-zinc-100">{project.name}</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">{project.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};
