import React, { useState, useEffect } from 'react';
import { Upload, Bot, CheckCircle2, Loader2, Cpu, Code2, BookOpen, Rocket, Globe, Pencil } from 'lucide-react';
import { onboardingApi } from '../../services/api';
import type { GoalTemplate } from './OnboardingWizard';
import ArcReactor from '../ironman/ArcReactor';
import HolographicCarousel from '../ironman/HolographicCarousel';

// ── All supported templates ────────────────────────────────────────────────────
const TEMPLATES: (GoalTemplate & { icon: any; description: string; color: string })[] = [
  {
    title: 'Master DSA (Striver A-Z)',
    category: 'DSA',
    type: 'dsa',
    isDSA: true,
    icon: Code2,
    description: 'Complete 440+ curated problems from the famous Striver A-Z sheet.',
    color: 'border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10',
  },
  {
    title: 'Competitive Programming',
    category: 'Competitive Programming',
    type: 'competitive',
    isDSA: false,
    icon: Cpu,
    description: 'Practice contest-style problems on Codeforces, Leetcode, and AtCoder.',
    color: 'border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10',
  },
  {
    title: 'System Design Mastery',
    category: 'System Design',
    type: 'system_design',
    isDSA: false,
    icon: Globe,
    description: 'Learn to design scalable distributed systems from scratch.',
    color: 'border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/10',
  },
  {
    title: 'Learn a New Language',
    category: 'Language Learning',
    type: 'language',
    isDSA: false,
    icon: BookOpen,
    description: 'Track vocabulary, grammar, and fluency milestones.',
    color: 'border-green-500/50 bg-green-500/5 hover:bg-green-500/10',
  },
  {
    title: 'Build a Project',
    category: 'Project',
    type: 'project',
    isDSA: false,
    icon: Rocket,
    description: 'Plan, track, and ship your personal or professional project.',
    color: 'border-pink-500/50 bg-pink-500/5 hover:bg-pink-500/10',
  },
  {
    title: 'Custom Goal',
    category: 'Custom',
    type: 'custom',
    isDSA: false,
    icon: Pencil,
    description: 'Build your own tracking dashboard from scratch.',
    color: 'border-border bg-card hover:border-primary/30',
  },
];

// ── Step 1: Template ───────────────────────────────────────────────────────────
export const Step1Template = ({
  next,
  setTemplate,
}: {
  next: () => void;
  setTemplate: (t: GoalTemplate) => void;
}) => {
  const [customizing, setCustomizing] = useState<typeof TEMPLATES[0] | null>(null);
  const [customName, setCustomName] = useState('');

  const handleSelect = (tpl: typeof TEMPLATES[0]) => {
    if (tpl.type === 'custom') {
      setCustomizing(tpl);
    } else {
      setTemplate({
        title: tpl.title,
        category: tpl.category,
        type: tpl.type,
        isDSA: tpl.isDSA,
      });
      next();
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customizing || !customName.trim()) return;
    setTemplate({
      title: customName.trim(),
      category: customizing.category,
      type: customizing.type,
      isDSA: customizing.isDSA,
    });
    next();
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 w-full relative">
      <div className="text-center mb-4 relative z-10">
        <h2 className="text-xl sm:text-3xl font-display font-bold text-[var(--color-arc-cyan)] tracking-widest uppercase filter drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">Select Module</h2>
        <p className="text-[var(--color-arc-cyan)]/70 font-display tracking-widest text-xs sm:text-sm mt-2 hidden sm:block">INITIALIZING PROTOCOL ROADMAPS...</p>
      </div>

      <div className={`transition-all duration-500 ${customizing ? 'opacity-30 pointer-events-none blur-sm' : ''}`}>
        <HolographicCarousel onSelect={handleSelect} />
      </div>

      {customizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in zoom-in-90 duration-300 p-4">
          <div className="bg-black/90 border-2 border-[var(--color-arc-cyan)] p-4 sm:p-8 rounded-xl shadow-[0_0_40px_rgba(0,212,255,0.3)] max-w-md w-full backdrop-blur-xl">
            <h3 className="text-base sm:text-xl font-display font-bold text-[var(--color-arc-cyan)] mb-4 tracking-widest uppercase text-center">CUSTOM GOAL</h3>
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                autoFocus
                placeholder="e.g. Master React..."
                className="w-full bg-black/50 border border-[var(--color-arc-cyan)]/50 focus:border-[var(--color-arc-cyan)] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-display tracking-wide outline-none placeholder:text-[var(--color-arc-cyan)]/30 text-center text-sm sm:text-lg"
              />
              <div className="flex gap-2 sm:gap-3 pt-2">
                <button type="button" onClick={() => setCustomizing(null)} className="flex-1 py-2 sm:py-3 bg-transparent border border-[var(--color-arc-cyan)]/30 text-[var(--color-arc-cyan)]/50 hover:text-[var(--color-arc-cyan)] hover:border-[var(--color-arc-cyan)] rounded-lg font-display tracking-widest uppercase transition-all text-xs sm:text-sm active:scale-95">Cancel</button>
                <button type="submit" disabled={!customName.trim()} className="flex-1 py-2 sm:py-3 bg-[var(--color-arc-cyan)]/20 border border-[var(--color-arc-cyan)] text-[var(--color-arc-cyan)] hover:bg-[var(--color-arc-cyan)] hover:text-black disabled:opacity-50 rounded-lg font-display tracking-widest uppercase font-bold transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)] text-xs sm:text-sm active:scale-95">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Step 2: Resources ──────────────────────────────────────────────────────────
export const Step2Resources = ({
  next,
  back,
  setContextText,
  resources,
  setResources,
}: {
  next: () => void;
  back: () => void;
  setContextText: (t: string) => void;
  resources: { filename: string; url: string; fileType: 'url' | 'pdf' | 'txt' }[];
  setResources: React.Dispatch<React.SetStateAction<{ filename: string; url: string; fileType: 'url' | 'pdf' | 'txt' }[]>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [resourceType, setResourceType] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [added, setAdded] = useState('');

  const handleAddUrl = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const { text } = await onboardingApi.parseUrl(url);
      setContextText(prev => prev ? `${prev}\n${text}` : text);
      let filename = label.trim();
      if (!filename) {
        try { filename = new URL(url).hostname; } catch { filename = url; }
      }
      const newResource = { filename, url, fileType: 'url' as const };
      setResources(prev => [newResource, ...prev]);
      setAdded(filename);
      setUrl('');
      setLabel('');
    } catch (e) {
      console.error(e);
      alert('Failed to parse URL. Try a different link or skip this step.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { text } = await onboardingApi.parseFile(file);
      setContextText(prev => prev ? `${prev}\n${text}` : text);
      const ext = file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'txt' | undefined;
      const newResource = { filename: file.name, url: '', fileType: ext ?? 'txt' };
      setResources(prev => [newResource, ...prev]);
      setAdded(file.name);
    } catch (err) {
      console.error(err);
      alert('Failed to parse file.');
    } finally {
      setLoading(false);
    }
  };

  const removeResource = (index: number) => {
    setResources(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold mb-2">Upload Resources</h2>
      <p className="text-muted-foreground mb-6">
        Add one or more links or files to personalize your plan. Forge AI will extract context from each source.
      </p>

      {resources.length > 0 && (
        <div className="mb-6 p-4 bg-card border border-border rounded-2xl space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Added resources</p>
              <p className="text-xs text-muted-foreground">You can add multiple files and websites before continuing.</p>
            </div>
            <span className="px-2 py-1 text-xs uppercase tracking-[0.18em] bg-primary/10 text-primary rounded-full">{resources.length}</span>
          </div>
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <div key={`${resource.filename}-${index}`} className="flex items-center justify-between gap-3 p-3 bg-background border border-border rounded-xl">
                <div>
                  <div className="font-medium text-sm">{resource.filename}</div>
                  <div className="text-xs text-muted-foreground truncate">{resource.fileType === 'url' ? resource.url || 'Website' : `${resource.fileType.toUpperCase()} file`}</div>
                </div>
                <button type="button" onClick={() => removeResource(index)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setResourceType('url')}
          className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition ${resourceType === 'url' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
        >
          Add Website
        </button>
        <button
          type="button"
          onClick={() => setResourceType('file')}
          className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition ${resourceType === 'file' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
        >
          Add File
        </button>
      </div>

      {resourceType === 'url' ? (
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Link</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Quick reference name"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              disabled={loading}
            />
          </div>
          <button onClick={handleAddUrl} disabled={loading || !url} className="w-full px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add website'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Upload file</label>
            <label className="cursor-pointer block rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center hover:border-primary/50 transition">
              <input type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileUpload} disabled={loading} />
              <Upload className="mx-auto mb-3 w-6 h-6 text-muted-foreground" />
              <p className="text-sm">Click to upload a PDF or TXT file</p>
            </label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">File name</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Example: syllabus.pdf"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-muted-foreground">Uploaded file text is extracted automatically and the file reference is kept for your goal resources.</p>
        </div>
      )}

      {added && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium truncate">{added}</span>
          <span className="ml-auto text-green-500/60">saved ✓</span>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={back} disabled={loading} className="px-6 py-2 rounded-lg font-medium hover:bg-muted transition">Back</button>
        <button onClick={next} disabled={loading} className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition">Continue</button>
      </div>
    </div>
  );
};

// ── Step 3: Availability ───────────────────────────────────────────────────────
export const Step3Availability = ({ next, back, availability, setAvailability }: any) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
    <h2 className="text-2xl font-bold mb-2">Your Availability</h2>
    <p className="text-muted-foreground mb-6">How much time can you commit to this goal?</p>

    <div className="space-y-6 mb-8 p-6 bg-card border border-border rounded-xl">
      <div>
        <label className="block text-sm font-medium mb-2">Hours per day: <span className="text-primary font-bold">{availability.hoursPerDay}h</span></label>
        <input type="range" min="1" max="8" value={availability.hoursPerDay} onChange={e => setAvailability({ ...availability, hoursPerDay: parseInt(e.target.value) })} className="w-full accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1h</span><span>8h</span></div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-3">Days active per week: <span className="text-primary font-bold">{availability.days} days</span></label>
        <div className="flex gap-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <button
              key={i}
              onClick={() => setAvailability({ ...availability, days: i + 1 })}
              className={`w-10 h-10 rounded-full font-medium text-sm transition-all ${i < availability.days ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="flex justify-between">
      <button onClick={back} className="px-6 py-2 rounded-lg font-medium hover:bg-muted transition">Back</button>
      <button onClick={next} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition">Continue</button>
    </div>
  </div>
);

// ── Step 4: Milestones ─────────────────────────────────────────────────────────
export const Step4Milestones = ({ next, back, milestones, setMilestones }: any) => {
  const updateMilestone = (index: number, field: string, value: string) => {
    const newM = [...milestones];
    newM[index][field] = value;
    setMilestones(newM);
  };
  const addMilestone = () => setMilestones([...milestones, { title: '', target_date: '' }]);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold mb-2">Draft Milestones</h2>
      <p className="text-muted-foreground mb-6">Break your goal down into major checkpoints.</p>

      <div className="space-y-3 mb-8 max-h-64 overflow-y-auto pr-1">
        {milestones.map((m: any, i: number) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
            <input type="text" value={m.title} onChange={e => updateMilestone(i, 'title', e.target.value)} placeholder={`Milestone ${i + 1}`} className="flex-1 px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            <input type="date" value={m.target_date} onChange={e => updateMilestone(i, 'target_date', e.target.value)} className="w-40 px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </div>
        ))}
        <button onClick={addMilestone} className="text-sm font-medium text-primary hover:underline mt-2 flex items-center gap-1">+ Add milestone</button>
      </div>

      <div className="flex justify-between">
        <button onClick={back} className="px-6 py-2 rounded-lg font-medium hover:bg-muted transition">Back</button>
        <button onClick={next} className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2">
          <Bot className="w-4 h-4" /> Analyze Plan
        </button>
      </div>
    </div>
  );
};

// ── Step 5: AI Analyzer ────────────────────────────────────────────────────────
export const Step5AIAnalyzer = ({ next, back, contextText, milestones, availability, setAnalysis }: any) => {
  const [localAnalysis, setLocalAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    onboardingApi.analyze(contextText, milestones, availability).then(res => {
      if (mounted) { setLocalAnalysis(res); setAnalysis(res); setLoading(false); }
    }).catch(err => {
      console.error(err);
      if (mounted) {
        setLocalAnalysis({ score: 75, verdict: 'Looks Achievable', advice: "Your plan looks solid! Stay consistent with your daily schedule and you'll hit your milestones." });
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 text-center flex flex-col items-center">
      <h2 className="text-3xl font-display font-bold text-[var(--color-arc-cyan)] tracking-widest uppercase filter drop-shadow-[0_0_10px_rgba(0,212,255,0.8)] mb-2">JARVIS System Analysis</h2>
      <p className="text-[var(--color-arc-cyan)]/70 font-display tracking-widest text-sm mb-6">PROCESSING ROADMAP FEASIBILITY...</p>

      <div className="w-full max-w-md mx-auto mb-8 relative">
        <div className="h-48 relative mb-6">
          <ArcReactor isCharging={loading} isSuccess={!loading && (localAnalysis?.score ?? 0) >= 70} />
        </div>

        {loading ? (
          <div className="font-display text-[var(--color-arc-cyan)] animate-pulse tracking-widest text-sm">
            <Bot className="inline w-5 h-5 mr-2 animate-bounce" /> ANALYZING PARAMETERS...
          </div>
        ) : (
          <div className="border border-[var(--color-arc-cyan)] bg-black/60 backdrop-blur-md rounded-xl p-6 text-left shadow-[0_0_30px_rgba(0,212,255,0.1)]">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-full border flex items-center justify-center font-black text-2xl flex-shrink-0 font-display shadow-[0_0_15px_currentColor] ${
                (localAnalysis?.score ?? 0) >= 80 ? 'border-[#4ADE80] text-[#4ADE80] bg-[#4ADE80]/10' :
                (localAnalysis?.score ?? 0) >= 50 ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' :
                'border-red-400 text-red-400 bg-red-400/10'
              }`}>
                {localAnalysis?.score ?? '--'}
              </div>
              <div>
                <h3 className="font-bold text-xl text-white font-display tracking-wide">{localAnalysis?.verdict ?? 'Analysis Complete'}</h3>
                <p className="text-sm text-[var(--color-arc-cyan)]/60 font-display tracking-widest">HOURS: {availability.hoursPerDay}/DAY | DAYS: {availability.days}/WK</p>
              </div>
            </div>
            <div className="bg-black/40 rounded-lg p-4 text-sm border border-[var(--color-arc-cyan)]/30 text-[var(--color-arc-cyan)]/80 leading-relaxed font-mono">
              <strong className="text-[var(--color-arc-cyan)] block mb-1 font-display tracking-wider">JARVIS ADVICE:</strong> 
              {'>'} {localAnalysis?.advice ?? 'Looks good, proceed!'}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between w-full mt-4">
        <button onClick={back} disabled={loading} className="px-6 py-2 bg-transparent text-[var(--color-arc-cyan)]/50 hover:text-[var(--color-arc-cyan)] border border-[var(--color-arc-cyan)]/30 hover:border-[var(--color-arc-cyan)] rounded-lg font-display tracking-widest transition-all disabled:opacity-30">
          ◀ BACK
        </button>
        <button onClick={next} disabled={loading} className="px-8 py-2 bg-[var(--color-arc-cyan)]/10 text-[var(--color-arc-cyan)] hover:bg-[var(--color-arc-cyan)] hover:text-black border border-[var(--color-arc-cyan)] shadow-[0_0_15px_rgba(0,212,255,0.3)] rounded-lg font-display font-bold tracking-widest transition-all disabled:opacity-30 disabled:shadow-none">
          INITIATE PROTOCOL
        </button>
      </div>
    </div>
  );
};

// ── Step 6: Done ───────────────────────────────────────────────────────────────
export const Step6Done = ({ finish, template }: { finish: () => void; template: GoalTemplate }) => {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-in zoom-in-95 duration-1000 flex flex-col items-center text-center py-8 min-h-[400px] justify-center">
      {booting ? (
        <div className="flex flex-col items-center gap-6">
          <div className="w-32 h-32 relative">
            {/* Simple Iron Man Helmet Assembly SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--color-arc-gold)] animate-pulse drop-shadow-[0_0_15px_rgba(255,184,0,0.8)]">
              <path fill="currentColor" d="M20 90 L80 90 L90 50 L80 10 L20 10 L10 50 Z" opacity="0.2"/>
              <path fill="currentColor" className="animate-[dash_2s_ease-out_forwards]" strokeDasharray="300" strokeDashoffset="300" stroke="currentColor" strokeWidth="2" d="M20 90 L80 90 L90 50 L80 10 L20 10 L10 50 Z"/>
              <circle cx="35" cy="40" r="8" fill="var(--color-arc-cyan)" className="animate-[ping_2s_ease-out_forwards]" />
              <circle cx="65" cy="40" r="8" fill="var(--color-arc-cyan)" className="animate-[ping_2s_ease-out_forwards]" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-[var(--color-arc-gold)] tracking-widest uppercase animate-pulse">ASSEMBLING ARMOR...</h2>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-24 h-24 rounded-full border-2 border-[var(--color-arc-cyan)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,212,255,0.4)] bg-[var(--color-arc-cyan)]/10">
            <CheckCircle2 className="w-12 h-12 text-[var(--color-arc-cyan)]" />
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">SYSTEMS ONLINE</h2>
          <p className="text-[var(--color-arc-cyan)] mb-10 max-w-sm font-mono tracking-wider">
            FORGE INTERFACE READY. LET'S GO.
          </p>
          <button onClick={finish} className="px-10 py-4 bg-[var(--color-arc-cyan)] text-black rounded-lg font-display font-bold tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.6)] hover:shadow-[0_0_40px_rgba(0,212,255,0.9)] hover:scale-105 transition-all active:scale-95">
            ENTER DASHBOARD
          </button>
        </div>
      )}
    </div>
  );
};
