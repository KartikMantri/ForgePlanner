import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, FileText, BookOpen, Code2,
  ArrowLeft, MoreHorizontal, Target, Calendar, CheckCircle2,
  Clock, TrendingUp, Plus, Zap, Trash2, Link, ExternalLink, Loader2, RefreshCw, Pencil, X
} from 'lucide-react';

import SpiderEntrance from '../components/spiderman/SpiderEntrance';
import SpiderWebBg from '../components/spiderman/SpiderWebBg';
import DSASheet from '../components/dsa/DSASheet';
import NotesTab from '../components/notes/NotesTab';
import SplineScene from '../components/three/SplineScene';
import { SCENE_URLS } from '../components/three/scenes';
import { goalsApi, tasksApi, resourcesApi, milestonesApi } from '../services/api';

// ── Shared helpers ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-400',
    in_progress: 'bg-blue-500/10 text-blue-400',
    pending: 'bg-muted text-white/60',
  };
  const labels: Record<string, string> = {
    completed: 'Done',
    in_progress: 'In Progress',
    pending: 'Pending',
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[status] ?? map.pending}`}>
      {labels[status] ?? status}
    </span>
  );
};

// ── Planner Tab ────────────────────────────────────────────────────────────────
const PlannerTab = ({ goal, onUpdate }: { goal: any, onUpdate: () => void }) => {
  const milestones: any[] = goal?.milestones ?? [];
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDate) return;
    setSaving(true);
    try {
      await milestonesApi.createMilestone(goal.id, newTitle, newDate);
      setIsAdding(false);
      setNewTitle('');
      setNewDate('');
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this milestone?')) return;
    await milestonesApi.deleteMilestone(id);
    onUpdate();
  };

  const handleToggleStatus = async (m: any) => {
    const nextStatus = m.status === 'pending' ? 'in_progress' : m.status === 'in_progress' ? 'completed' : 'pending';
    await milestonesApi.updateMilestone(m.id, { status: nextStatus });
    onUpdate();
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-military font-black text-white uppercase text-shadow-comic mb-1 tracking-wider">ROADMAP</h2>
          <p className="text-white/60 text-xs sm:text-sm font-display tracking-widest hidden sm:block">WEB OF MILESTONES.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-3 sm:px-4 py-2 bg-[var(--color-spider-red)] text-white border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all font-black uppercase text-xs sm:text-sm flex items-center gap-1 sm:gap-2 active:scale-95 flex-shrink-0"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Add Node</span>
        </button>
      </div>

      {isAdding && (
        <div className="spider-panel p-3 sm:p-5 mb-4 sm:mb-6 animate-in slide-in-from-top-2 border-4 border-black">
          <h3 className="font-military font-black uppercase text-base sm:text-xl mb-3 sm:mb-4">New Web Node</h3>
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              placeholder="Title..."
              className="flex-1 px-3 sm:px-4 py-2 bg-white/5 border-2 border-white/20 rounded focus:border-[var(--color-spider-red)] focus:outline-none text-white font-display text-sm"
              autoFocus
            />
            <input 
              type="date" 
              value={newDate} 
              onChange={e => setNewDate(e.target.value)}
              className="px-3 sm:px-4 py-2 bg-white/5 border-2 border-white/20 rounded focus:border-[var(--color-spider-red)] focus:outline-none text-white/80 font-display text-sm"
            />
            <div className="flex gap-2 flex-col sm:flex-row">
              <button onClick={() => setIsAdding(false)} className="px-3 sm:px-4 py-2 border-2 border-white/20 text-white/60 rounded hover:bg-white/10 font-black uppercase transition-colors text-xs sm:text-sm flex-1 sm:flex-none">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="px-4 sm:px-6 py-2 bg-[var(--color-spider-red)] text-white border-2 border-black rounded shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all font-black uppercase flex items-center justify-center text-xs sm:text-sm flex-1 sm:flex-none active:scale-95">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative pl-8 pt-4 pb-8 space-y-10">
        {/* SVG Web Path */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10"></div>
        <svg className="absolute left-4 top-0 bottom-0 w-8 h-full overflow-visible pointer-events-none z-0" style={{ transform: 'translateX(-50%)' }}>
          <path d={`M 16 0 L 16 ${milestones.length * 100}`} fill="none" stroke="var(--color-spider-red)" strokeWidth="4" strokeDasharray="10 10" className="spider-web-path" />
        </svg>

        {milestones.length === 0 && !isAdding ? (
          <div className="p-12 rounded-xl border-4 border-dashed border-white/20 text-center text-white/60 text-sm font-display tracking-widest bg-black/40">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-30 text-[var(--color-spider-red)]" />
            NO NODES ON THE WEB. SHOOT ONE ABOVE.
          </div>
        ) : (
          milestones.map((m: any, i: number) => {
            const isDone = m.status === 'completed';
            const isInProg = m.status === 'in_progress';
            return (
              <div key={m.id} className={`group relative flex items-center gap-6 transition-all ${isDone ? 'opacity-70 hover:opacity-100' : ''}`}>
                {/* Node Point */}
                <button 
                  onClick={() => handleToggleStatus(m)}
                  className={`absolute -left-[40px] w-12 h-12 rounded-full border-4 border-black flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(204,0,0,0.5)] z-10 transition-all hover:scale-110 ${
                    isDone ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.5)]' :
                    isInProg ? 'bg-blue-500 text-black' :
                    'bg-black text-[var(--color-spider-red)] border-[var(--color-spider-red)]'
                  }`}
                  title="Click to cycle status"
                >
                  {isDone ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
                </button>
                
                {/* Card */}
                <div className={`spider-panel flex-1 p-5 rounded-xl border-4 transition-all ml-4 relative ${
                  isDone ? 'border-green-500/50 bg-green-500/5' : 
                  isInProg ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-blue-500/10' : 
                  'border-[var(--color-spider-red)]/50 hover:border-[var(--color-spider-red)]'
                }`}>
                  {/* Connector line */}
                  <div className={`absolute top-1/2 -left-4 w-4 h-1 -translate-y-1/2 ${isDone ? 'bg-green-500' : isInProg ? 'bg-blue-500' : 'bg-[var(--color-spider-red)]/50'}`}></div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-military font-black text-xl uppercase ${isDone ? 'line-through text-white/50' : 'text-white'}`}>{m.title}</h4>
                      <div className="flex items-center gap-4 mt-2 flex-wrap font-display">
                        <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-spider-red)] bg-black/50 px-2 py-1 border border-[var(--color-spider-red)]/30 rounded">
                          <Calendar className="w-3 h-3" />
                          {m.target_date}
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                    </div>
                    
                    <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 p-2 bg-red-900/50 text-white hover:bg-red-500 rounded border-2 border-black transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Tasks Tab ──────────────────────────────────────────────────────────────────
const TasksTab = ({ goalId }: { goalId: string }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [powId, setPowId] = useState<string | null>(null);

  useEffect(() => {
    tasksApi.listTasks(goalId)
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [goalId]);

  const toggle = async (task: any) => {
    setSaving(task.id);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    // POW animation on complete
    if (newStatus === 'completed') {
      setPowId(task.id);
      setTimeout(() => setPowId(null), 1000);
    }

    try {
      const updated = await tasksApi.updateTask(task.id, { status: newStatus });
      setTasks(t => t.map(x => x.id === task.id ? updated : x));
    } finally {
      setSaving(null);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setSaving('new');
    try {
      const created = await tasksApi.createTask(newTask, goalId, 10);
      setTasks(t => [...t, created]);
      setNewTask('');
    } finally {
      setSaving(null);
    }
  };

  const deleteTask = async (id: string) => {
    setSaving(id);
    try {
      await tasksApi.deleteTask(id);
      setTasks(t => t.filter(x => x.id !== id));
    } finally {
      setSaving(null);
    }
  };

  const done = tasks.filter(t => t.status === 'completed').length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="p-3 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-5xl font-military font-black text-white uppercase text-shadow-comic mb-1 tracking-wider">DAILY MISSIONS</h2>
        <p className="text-[var(--color-spider-red)] font-display text-xs sm:text-sm font-bold tracking-widest hidden sm:block">GET IT DONE.</p>
      </div>

      {/* Comic-style Progress bar */}
      <div className="spider-panel border-4 border-black p-6 mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_2px,transparent_2px)] [background-size:12px_12px] opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <span className="font-military font-black uppercase text-xl tracking-wide">COMPLETION</span>
          <span className="text-xl font-black text-[var(--color-spider-red)] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{done}/{tasks.length}</span>
        </div>
        <div className="h-4 bg-black border-2 border-white/20 rounded-none overflow-hidden relative z-10">
          <div className="h-full bg-[var(--color-spider-red)] transition-all duration-1000 relative" style={{ width: `${pct}%` }}>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[size:10px_10px]"></div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 relative z-10">
          <div className="bg-yellow-400 border-2 border-black px-2 py-1 shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center gap-1 font-black text-black text-xs uppercase">
            <Zap className="w-3 h-3 fill-black" />
            {tasks.filter(t => t.status === 'completed').reduce((a: number, t: any) => a + (t.xp_value ?? 10), 0)} XP EARNED
          </div>
        </div>
      </div>

      {/* Add task */}
      <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8 p-3 sm:p-0">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="What's the next move?"
          className="flex-1 px-3 sm:px-5 py-2 sm:py-3 bg-white text-black border-4 border-black rounded-none font-military font-bold text-sm sm:text-lg focus:outline-none focus:ring-4 focus:ring-[var(--color-spider-red)]/50 shadow-[2px_2px_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_rgba(0,0,0,1)] placeholder:text-black/40 min-w-0"
        />
        <button
          type="submit"
          disabled={saving === 'new'}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-[var(--color-spider-red)] text-white border-4 border-black font-military font-black text-sm sm:text-xl uppercase hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] shadow-[2px_2px_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_rgba(0,0,0,1)] active:scale-95 sm:active:scale-100 flex-shrink-0 min-w-16 sm:min-w-fit"
        >
          {saving === 'new' ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />}
          <span className="hidden sm:inline">ADD</span>
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-[var(--color-spider-red)] font-display tracking-widest font-bold">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> SCANNING FOR MISSIONS...
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 border-4 border-dashed border-white/20 text-center text-white/50 bg-black/40 font-military font-bold text-xl uppercase">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          NO MISSIONS LOGGED. GET TO WORK.
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => {
            const isDone = task.status === 'completed';
            const isPow = powId === task.id;
            
            return (
              <div
                key={task.id}
                className={`relative flex items-center gap-5 p-4 border-4 transition-all duration-300 ${
                  isDone ? 'bg-black/60 border-black opacity-70 hover:opacity-100 grayscale hover:grayscale-0' : 'spider-panel border-black hover:border-[var(--color-spider-red)] hover:shadow-[6px_6px_0_rgba(204,0,0,0.5)] shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white/5'
                }`}
              >
                {/* Comic POW Burst Overlay */}
                {isPow && (
                  <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="task-pow font-military font-black text-5xl text-yellow-400 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase tracking-tighter" style={{ WebkitTextStroke: '2px black' }}>
                      POW!
                    </div>
                  </div>
                )}

                <button onClick={() => toggle(task)} disabled={saving === task.id} className="flex-shrink-0 relative">
                  <div className={`w-8 h-8 border-4 transition-colors flex items-center justify-center ${
                    isDone ? 'border-[var(--color-spider-red)] bg-[var(--color-spider-red)]' : 'border-white/50 bg-black hover:border-white'
                  }`}>
                    {saving === task.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-white" />
                      : isDone && <svg viewBox="0 0 24 24" className="w-6 h-6 text-white stroke-[4] fill-none stroke-current" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    }
                  </div>
                </button>
                
                <span className={`flex-1 font-display font-bold text-lg tracking-wide transition-all ${isDone ? 'text-white/40 decoration-[var(--color-spider-red)] decoration-4' : 'text-white'} ${isDone ? "relative after:content-[''] after:absolute after:top-1/2 after:left-0 after:w-full after:h-1 after:bg-[var(--color-spider-red)] after:-translate-y-1/2 after:rotate-[-1deg]" : ""}`}>
                  {task.title}
                </span>
                
                <span className={`text-xs font-black px-2 py-1 border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center gap-1 ${isDone ? 'bg-black text-white/40' : 'bg-yellow-400 text-black'}`}>
                  <Zap className={`w-3 h-3 ${isDone ? 'text-white/40' : 'fill-black'}`} />{task.xp_value ?? 10} XP
                </span>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 bg-black border-2 border-black text-white/50 hover:text-red-500 hover:border-red-500 transition-all rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Resources Tab ──────────────────────────────────────────────────────────────
const ResourcesTab = ({ goalId }: { goalId: string }) => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceType, setResourceType] = useState<'url' | 'file'>('url');
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newFilePath, setNewFilePath] = useState('');
  const [newFileType, setNewFileType] = useState<'url' | 'pdf' | 'txt'>('url');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    resourcesApi.listResources(goalId)
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [goalId]);

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resourceType === 'url' && !newUrl.trim()) return;
    if (resourceType === 'file' && !newLabel.trim()) return;

    let label = newLabel.trim();
    let path = resourceType === 'url' ? newUrl.trim() : newFilePath.trim();
    if (!label && resourceType === 'url') {
      try { label = new URL(newUrl).hostname; } catch { label = newUrl; }
    }
    if (!label) {
      label = resourceType === 'file' ? 'File resource' : 'Resource';
    }

    setSaving(true);
    try {
      const created = await resourcesApi.createResource(goalId, label, path, newFileType);
      setResources(r => [created, ...r]);
      setNewUrl('');
      setNewLabel('');
      setNewFilePath('');
      setNewFileType(resourceType === 'url' ? 'url' : 'pdf');
    } finally {
      setSaving(false);
    }
  };

  const deleteResource = async (id: string) => {
    await resourcesApi.deleteResource(id);
    setResources(r => r.filter(x => x.id !== id));
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      <div className="mb-6">
        <h2 className="text-4xl font-military font-black text-white uppercase text-shadow-comic mb-1">Resources</h2>
        <p className="text-white/60 text-sm">Links and materials for this goal.</p>
      </div>

      {/* Add resource */}
      <form onSubmit={addResource} className="glass-panel border border-border/50 rounded-2xl p-4 mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setResourceType('url'); setNewFileType('url'); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${resourceType === 'url' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
          >
            Add Website
          </button>
          <button
            type="button"
            onClick={() => setResourceType('file')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${resourceType === 'file' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
          >
            Add File Reference
          </button>
        </div>

        <div className="font-display font-semibold text-sm flex items-center gap-2">
          <Link className="w-4 h-4 text-primary" /> {resourceType === 'url' ? 'Add a Link' : 'Add a File'}
        </div>

        {resourceType === 'url' ? (
          <div className="grid md:grid-cols-[1fr_220px] gap-2">
            <input
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Label (optional)"
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_180px] gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="File name or title"
              className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={newFilePath}
              onChange={e => setNewFilePath(e.target.value)}
              placeholder="Optional file path / URL"
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}

        {resourceType === 'file' && (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setNewFileType('pdf')}
              className={`px-3 py-2 rounded-lg text-sm ${newFileType === 'pdf' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            >PDF</button>
            <button
              type="button"
              onClick={() => setNewFileType('txt')}
              className={`px-3 py-2 rounded-lg text-sm ${newFileType === 'txt' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            >TXT</button>
            <button
              type="button"
              onClick={() => setNewFileType('url')}
              className={`px-3 py-2 rounded-lg text-sm ${newFileType === 'url' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            >Reference</button>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <button
            type="submit"
            disabled={saving || (resourceType === 'url' ? !newUrl.trim() : !newLabel.trim())}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
          <span className="text-xs text-muted-foreground">Add multiple resources in a row.</span>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-white/60">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading resources...
        </div>
      ) : resources.length === 0 ? (
        <div className="p-12 rounded-xl border-2 border-dashed border-border text-center text-white/60 text-sm">
          <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
          No resources yet. Add a link above to save it here.
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((r: any) => (
            <div key={r.id} className="flex items-center gap-4 p-4 glass-panel rounded-2xl border border-border/50 group">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Link className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-display font-semibold text-sm truncate">{r.filename}</div>
                {r.file_path && (
                  <div className="text-xs text-white/60 truncate">{r.file_path}</div>
                )}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {r.file_path && (
                  <a href={r.file_path} target="_blank" rel="noreferrer"
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors text-white/60 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => deleteResource(r.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-white/60 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 rounded-full font-medium">
                {r.file_type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Tab Definitions ─────────────────────────────────────────────────────────────
const ALL_TABS = [
  { id: 'planner',   label: 'Planner',   icon: LayoutDashboard, dsaOnly: false },
  { id: 'tasks',     label: 'Tasks',     icon: CheckSquare,      dsaOnly: false },
  { id: 'resources', label: 'Resources', icon: FileText,         dsaOnly: false },
  { id: 'notes',     label: 'Notes',     icon: BookOpen,         dsaOnly: false },
  { id: 'dsa',       label: 'DSA Sheet', icon: Code2,            dsaOnly: true  },
];

// ── Goal Dashboard ─────────────────────────────────────────────────────────────
export default function GoalDashboard() {
  const [showEntrance, setShowEntrance] = useState(true);
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [goal, setGoal] = useState<any>(null);
  const [goalLoading, setGoalLoading] = useState(true);

  // Determine if this is a DSA-type goal (from nav state or loaded goal)
  const navGoalType = (location.state as any)?.goalType ?? '';
  const goalType = goal?.type ?? navGoalType;
  const isDSAGoal = ['dsa', 'competitive'].includes(goalType);

  // Filter visible tabs based on goal type
  const TABS = ALL_TABS.filter(t => !t.dsaOnly || isDSAGoal);

  // Pick the right default tab: DSA goals → dsa tab, others → planner
  const defaultTab = isDSAGoal ? 'dsa' : 'planner';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const fetchGoal = useCallback(() => {
    if (!goalId) return;
    setGoalLoading(true);
    goalsApi.getGoal(goalId)
      .then(data => {
        setGoal(data);
        // Once we know the goal type, snap to correct default tab if still on initial
        const type = data?.type ?? '';
        const isDSA = ['dsa', 'competitive'].includes(type);
        setActiveTab(t => t === defaultTab ? (isDSA ? 'dsa' : 'planner') : t);
      })
      .catch(() => setGoal({ title: 'My Goal', category: 'Custom', type: 'custom', milestones: [] }))
      .finally(() => setGoalLoading(false));
  }, [goalId]);

  useEffect(() => { fetchGoal(); }, [fetchGoal]);

  const renderTab = () => {
    switch (activeTab) {
      case 'planner':   return <PlannerTab goal={goal} onUpdate={fetchGoal} />;
      case 'tasks':     return <TasksTab goalId={goalId!} />;
      case 'resources': return <ResourcesTab goalId={goalId!} />;
      case 'notes':     return <NotesTab />;
      case 'dsa':       return <DSASheet />;
      default:          return <DSASheet />;
    }
  };

  const healthScore = goal?.health_score ?? 94;
  const healthColor = healthScore >= 80 ? 'text-green-400' : healthScore >= 60 ? 'text-yellow-400' : 'text-red-400';

  // ── Three-dot menu ──────────────────────────────────────────────────────────
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDeleteGoal = async () => {
    if (!window.confirm(`Delete "${goal?.title ?? 'this goal'}"?\n\nThis will permanently remove all tasks, milestones, notes, and DSA progress.`)) return;
    setDeleting(true);
    try {
      await goalsApi.deleteGoal(goalId!);
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      alert('Failed to delete goal. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <>
      {showEntrance && <SpiderEntrance onComplete={() => setShowEntrance(false)} />}
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col relative font-display">
        {/* Persistent 3D ambience — real WebGL when VITE_SPLINE_SPIDERMAN_SCENE is set, falls back to the existing SVG web bg */}
        <SplineScene
          sceneUrl={SCENE_URLS.spiderman}
          fallback={<SpiderWebBg />}
          className="fixed inset-0 z-0 pointer-events-none"
        />
        {/* Spider-Man Halftone BG */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(204,0,0,0.05)_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none z-0"></div>
        
        {/* Header - Stark/Spider Tech Theme */}
        <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-[var(--color-spider-red)]/50 shadow-[0_5px_30px_rgba(204,0,0,0.25)] relative px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between overflow-hidden overflow-x-auto">
          {/* Tech grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(204,0,0,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(204,0,0,0.15)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none z-0"></div>

          <div className="flex items-center gap-2 sm:gap-4 relative z-10 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 sm:p-2 hover:bg-[var(--color-spider-red)]/20 rounded-full transition-colors text-white border border-transparent hover:border-[var(--color-spider-red)]/50 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 border border-[var(--color-spider-red)] rounded-full flex items-center justify-center transition-colors relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(204,0,0,0.8)] flex-shrink-0">
              <img src="/forge-logo.png" alt="Forge Logo" className="w-full h-full object-cover rounded-full" />
            </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="px-1.5 sm:px-2 py-0.5 rounded-sm text-[10px] sm:text-xs font-black uppercase bg-black text-white border-2 border-black shadow-[2px_2px_0_rgba(255,255,255,0.5)] flex-shrink-0">
                {goal?.category ?? 'Goal'}
              </span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            </div>
            <h1 className="text-base sm:text-2xl font-black font-military text-white uppercase text-shadow-comic tracking-tight truncate">
              {goalLoading ? '...' : (goal?.title ?? 'My Goal')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="text-right mr-1 sm:mr-2 hidden sm:block">
            <div className="text-[10px] sm:text-xs text-white/60">Health</div>
            <div className={`text-base sm:text-xl font-black ${healthColor}`}>{healthScore}%</div>
          </div>

          {/* Three-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(v => !v)}
              disabled={deleting}
              className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50 active:scale-95 flex-shrink-0"
            >
              {deleting
                ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                : <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 sm:w-52 glass border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-1">
                  <button
                    onClick={() => { setShowMenu(false); fetchGoal(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 flex-shrink-0" />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); navigate('/'); }}
                    className="w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 flex-shrink-0" />
                    <span>Home</span>
                  </button>

                  <div className="h-px bg-border mx-3 my-1" />

                  <button
                    onClick={() => { setShowMenu(false); handleDeleteGoal(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

        <div className="flex flex-1 overflow-hidden relative z-10">
          {/* Sidebar */}
          <aside className="w-64 border-r-4 border-black bg-white/5 hidden md:flex flex-col p-4 gap-2 overflow-y-auto">
            <div className="text-xs font-black text-white/50 uppercase tracking-widest mb-2 px-3 mt-2">Views</div>

            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-300 text-sm font-bold border border-transparent
                    ${isActive
                      ? 'bg-gradient-to-r from-[var(--color-spider-red)]/20 to-transparent text-white border-l-[3px] border-l-[var(--color-spider-red)] shadow-[inset_10px_0_20px_rgba(204,0,0,0.1)]'
                      : 'hover:bg-white/10 text-white/70 hover:text-white hover:border-white/10'
                    }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}

            <div className="mt-auto p-3">
              <div className="p-4 rounded-sm bg-black/40 border-2 border-white/10">
                <h3 className="font-black text-xs mb-1 text-yellow-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> KEEP IT UP!
                </h3>
                <p className="text-xs text-white/60">Stay consistent — every problem solved matters.</p>
              </div>
            </div>
          </aside>

          {/* Mobile bottom nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-black/90 backdrop-blur-md border-t border-[var(--color-spider-red)]/30 flex items-center justify-around p-2 shadow-[0_-5px_30px_rgba(204,0,0,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(204,0,0,0.1)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none z-0"></div>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-2 rounded relative z-10 transition-colors ${isActive ? 'text-[var(--color-spider-red)] drop-shadow-[0_0_8px_rgba(204,0,0,0.8)]' : 'text-white/50 hover:text-white/80'}`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold tracking-wider">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-black/20">
            <div className="max-w-7xl mx-auto h-full pb-20 md:pb-0">
              {renderTab()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
