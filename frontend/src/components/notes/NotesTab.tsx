import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNotes } from '../../hooks/useNotes';
import { NoteEditor } from './NoteEditor';
import { FileText, Plus } from 'lucide-react';

export default function NotesTab() {
  const { goalId } = useParams<{ goalId: string }>();
  const { pages, activePage, loading, loadPage, createPage, saveBlocks } = useNotes(goalId || '');
  const [newTitle, setNewTitle] = useState('');

  if (loading && pages.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Loading notes...</div>;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createPage(newTitle);
    setNewTitle('');
  };

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] animate-in fade-in duration-500 bg-black/80 rounded-xl border border-[var(--color-arc-cyan)]/50 mt-6 overflow-hidden relative shadow-[0_0_30px_rgba(0,212,255,0.15)] group">
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-0"></div>

      {/* Sidebar (List of pages) */}
      <div className="w-64 border-r border-[var(--color-arc-cyan)]/30 bg-black/60 flex flex-col relative z-10">
        <div className="p-4 border-b border-[var(--color-arc-cyan)]/30 bg-[var(--color-arc-cyan)]/5">
          <form onSubmit={handleCreate} className="relative">
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="INITIALIZE NEW LOG..." 
              className="w-full pl-3 pr-10 py-2 bg-black/50 border border-[var(--color-arc-cyan)]/50 rounded focus:outline-none focus:border-[var(--color-arc-cyan)] text-[var(--color-arc-cyan)] font-display text-xs tracking-widest placeholder:text-[var(--color-arc-cyan)]/40 transition-colors"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-[var(--color-arc-cyan)]/20 text-[var(--color-arc-cyan)] rounded hover:bg-[var(--color-arc-cyan)] hover:text-black transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {pages.length === 0 ? (
            <div className="p-4 text-center text-xs font-display tracking-widest text-[var(--color-arc-cyan)]/50">
              NO LOGS DETECTED.
            </div>
          ) : (
            pages.map(p => (
              <button
                key={p.id}
                onClick={() => loadPage(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded text-xs text-left transition-all font-display tracking-widest border
                  ${activePage?.id === p.id 
                    ? 'bg-[var(--color-arc-cyan)]/20 text-[var(--color-arc-cyan)] border-[var(--color-arc-cyan)] shadow-[inset_0_0_15px_rgba(0,212,255,0.2)]' 
                    : 'bg-transparent text-[var(--color-arc-cyan)]/60 border-transparent hover:border-[var(--color-arc-cyan)]/30 hover:bg-[var(--color-arc-cyan)]/5 hover:text-[var(--color-arc-cyan)]'}
                `}
              >
                <FileText className="w-4 h-4 opacity-70" />
                <span className="truncate">{p.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      {activePage ? (
        <div className="flex-1 relative z-10">
          <NoteEditor 
            page={activePage} 
            onSave={(blocks) => saveBlocks(activePage.id, blocks)} 
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-arc-cyan)]/40 bg-black/40 relative z-10 font-display tracking-widest">
          <FileText className="w-16 h-16 mb-4 opacity-20" />
          <p>AWAITING INPUT COMMAND...</p>
        </div>
      )}
    </div>
  );
}
