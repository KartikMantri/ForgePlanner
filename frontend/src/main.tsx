import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import GoalDashboard from './pages/GoalDashboard';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import IronManHero from './components/ironman/IronManHero';
import { goalsApi } from './services/api';
import { Plus, ArrowRight, Target, Flame, Code2, BookOpen } from 'lucide-react';
import './index.css';

// ── Master Dashboard ───────────────────────────────────────────────────────────
const MasterDashboard = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    goalsApi.listGoals().then(setGoals).catch(() => {
      setGoals([{
        id: '00000000-0000-0000-0000-000000000002',
        title: 'Master DSA (Striver A-Z)',
        category: 'DSA',
        status: 'active',
        type: 'dsa'
      }]);
    });
  }, []);

  // 3D Tilt Effect for Cards (Disabled on mobile/touch)
  const isTouchDevice = () => {
    return (
      (typeof window !== 'undefined' && ('ontouchstart' in window)) ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (isTouchDevice()) return; // Disable on touch devices
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Highlight effect
    const highlight = card.querySelector('.card-highlight') as HTMLElement;
    if (highlight) {
      highlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0,212,255,0.1) 0%, transparent 50%)`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchDevice()) return; // Disable on touch devices
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const highlight = card.querySelector('.card-highlight') as HTMLElement;
    if (highlight) {
      highlight.style.background = 'transparent';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col font-military selection:bg-[var(--color-arc-cyan)] selection:text-black">
      
      {/* Header */}
      <header className="relative z-20 border-b border-[var(--color-arc-cyan)]/20 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer min-w-0">
            <div className="w-8 sm:w-10 h-8 sm:h-10 border border-[var(--color-arc-cyan)] rounded-full flex items-center justify-center transition-colors relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(0,212,255,0.8)] flex-shrink-0">
              <img src="/forge-logo.png" alt="Forge Logo" className="w-full h-full object-cover rounded-full" />
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--color-arc-cyan)] rounded-tl-full"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--color-arc-cyan)] rounded-br-full"></div>
            </div>
            <span className="text-lg sm:text-2xl font-display font-black tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,212,255,0.5)] truncate">
              FORGE
            </span>
          </div>
          
          <button
            onClick={() => setShowWizard(true)}
            className="group relative px-3 sm:px-6 py-2 bg-transparent border border-[var(--color-arc-cyan)] text-[var(--color-arc-cyan)] font-display tracking-widest text-xs sm:text-sm hover:text-black hover:bg-[var(--color-arc-cyan)] transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.6)] flex-shrink-0 active:scale-95 sm:active:scale-100"
          >
            <span className="relative z-10 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> 
              <span className="hidden sm:inline">INITIATE</span>
              <span className="sm:hidden">+</span>
            </span>
            <div className="absolute inset-0 bg-[var(--color-arc-cyan)] transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 flex flex-col">
        
        {/* Iron Man Hero Section */}
        <IronManHero stats={{ total: goals.length }} />

        {/* Workspaces Section */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <h2 className="text-sm sm:text-xl font-display text-[var(--color-arc-cyan)] tracking-widest flex items-center gap-2 whitespace-nowrap">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--color-arc-cyan)] animate-pulse flex-shrink-0"></span>
              <span className="hidden sm:inline">ACTIVE_MODULES</span>
              <span className="sm:hidden">MODULES</span>
            </h2>
            <div className="h-[1px] w-16 sm:w-32 bg-gradient-to-r from-[var(--color-arc-cyan)]/50 to-transparent flex-shrink-0"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-20">
          {goals.map((goal: any, index: number) => (
            <button
              key={goal.id}
              onClick={() => navigate(`/goals/${goal.id}`)}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={handleMouseLeave}
              className="iron-panel text-left p-4 sm:p-6 transition-all duration-200 group active:scale-95 touch:scale-100"
              style={{ transition: 'transform 0.1s ease-out' }}
            >
              {/* Hover Highlight Layer */}
              <div className="card-highlight absolute inset-0 pointer-events-none rounded-xl transition-colors duration-300 z-0"></div>
              
              {/* Corner Brackets generated by CSS */}
              <div className="iron-bracket-tl"></div><div className="iron-bracket-tr"></div>
              <div className="iron-bracket-bl"></div><div className="iron-bracket-br"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-arc-cyan)]/10 text-[var(--color-arc-cyan)] text-[10px] sm:text-xs font-display tracking-widest uppercase border border-[var(--color-arc-cyan)]/30 flex-shrink-0">
                    {goal.category === 'DSA' ? <Code2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" /> : <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />}
                    <span className="hidden sm:inline">{goal.category || goal.type}</span>
                  </span>
                  
                  {/* Status Indicator: Gold Thruster Dot */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <span className="text-[8px] sm:text-[10px] font-display tracking-widest text-[var(--color-arc-gold)]/80 hidden sm:inline">ONLINE</span>
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--color-arc-gold)] shadow-[0_0_10px_#FFB800] rounded-full animate-pulse flex-shrink-0"></span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg sm:text-2xl mb-2 text-white group-hover:text-[var(--color-arc-cyan)] transition-colors duration-300 tracking-wide line-clamp-2">
                  {goal.title}
                </h3>
                
                <div className="flex items-center gap-3 sm:gap-6 mt-4 sm:mt-6 flex-wrap">
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[10px] font-display text-[var(--color-arc-cyan)]/60 tracking-widest">MILESTONES</span>
                    <span className="text-base sm:text-lg font-bold text-white">{goal.milestones?.length || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[10px] font-display text-[var(--color-arc-cyan)]/60 tracking-widest">PWR</span>
                    <span className="text-base sm:text-lg font-bold text-[var(--color-arc-gold)] flex items-center gap-1">
                      <Flame className="w-3 h-3 sm:w-4 sm:h-4" /> 0
                    </span>
                  </div>
                  <div className="ml-auto w-8 h-8 sm:w-10 sm:h-10 border border-[var(--color-arc-cyan)]/30 flex items-center justify-center text-[var(--color-arc-cyan)] group-hover:bg-[var(--color-arc-cyan)] group-hover:text-black transition-colors duration-300 flex-shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>

              {/* Glowing bottom bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-[var(--color-arc-cyan)] w-0 group-hover:w-full transition-all duration-500 shadow-[0_0_10px_#00D4FF]"></div>
            </button>
          ))}

          {/* New Goal Button */}
          <button
            onClick={() => setShowWizard(true)}
            className="relative border border-dashed border-[var(--color-arc-cyan)]/30 bg-black/40 hover:bg-[var(--color-arc-cyan)]/5 hover:border-[var(--color-arc-cyan)] transition-all flex flex-col items-center justify-center gap-2 sm:gap-4 min-h-[150px] sm:min-h-[200px] group active:scale-95 p-4"
          >
            <div className="absolute top-2 left-2 w-1.5 h-1.5 sm:w-2 sm:h-2 border-t border-l border-[var(--color-arc-cyan)]/50"></div>
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 border-b border-r border-[var(--color-arc-cyan)]/50"></div>
            
            <div className="w-10 h-10 sm:w-12 sm:h-12 border border-[var(--color-arc-cyan)]/50 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--color-arc-cyan)]/20 group-hover:border-[var(--color-arc-cyan)] group-hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-arc-cyan)]" />
            </div>
            <div className="text-center font-display tracking-widest">
              <span className="block text-[var(--color-arc-cyan)] mb-0.5 sm:mb-1 text-sm sm:text-base">NEW</span>
              <span className="text-[8px] sm:text-[10px] text-white/50 hidden sm:block">AWAITING INPUT</span>
            </div>
          </button>
        </div>
      </main>

      {showWizard && (
        <OnboardingWizard onComplete={(id: string, goalType: string) => {
          setShowWizard(false);
          goalsApi.listGoals().then(setGoals).catch(() => {});
          navigate(`/goals/${id}`, { state: { goalType } });
        }} />
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MasterDashboard />} />
        <Route path="/goals/:goalId" element={<GoalDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
