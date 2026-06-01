import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDSASheet } from '../../hooks/useDSASheet';
import { DSATopicHeatmap } from './DSATopicHeatmap';
import { DSATopicGroup } from './DSATopicGroup';
import { DSAProblemDrawer } from './DSAProblemDrawer';
import { Search, Filter } from 'lucide-react';
import type { DSASheetRow, DSAProgressUpdate } from '../../types';

export default function DSASheet() {
  const { goalId } = useParams<{ goalId: string }>();
  const {
    summary,
    topicGroups,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    updateProgress,
    seedSheet,
    refresh,
  } = useDSASheet(goalId || '');

  const [activeRow, setActiveRow] = useState<DSASheetRow | null>(null);

  // ── Seeding state ────────────────────────────────────────────────────────────
  // Track if we're waiting for the background seed (triggered by goal creation)
  // or if we need to seed ourselves as a fallback.
  const [waitingForSeed, setWaitingForSeed] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  useEffect(() => {
    // Already loading — wait
    if (loading) return;

    const isEmpty = !summary || summary.total === 0;
    const isError = error && error !== 'not_found';

    if (!isEmpty || isError) {
      // Data is present or there's a non-seed error — stop polling
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      setWaitingForSeed(false);
      return;
    }

    // Sheet is empty — the background seed (from goal creation) may still be running.
    // Start polling every 2.5s to check; fall back to manual seed after 10s.
    if (!waitingForSeed) {
      setWaitingForSeed(true);
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        if (attempts < 4) {
          // First 10s: just refresh to check if background seed finished
          refresh();
        } else {
          // Background seed is taking too long — trigger it ourselves
          clearInterval(pollRef.current!);
          pollRef.current = null;
          seedSheet();
        }
      }, 2500);
    }
  }, [loading, summary, error, waitingForSeed, refresh, seedSheet]);

  // ── Render states ─────────────────────────────────────────────────────────────

  if (waitingForSeed || error === 'not_found') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-bold mb-2">Setting up your DSA Sheet…</h2>
        <p className="text-muted-foreground max-w-md animate-pulse">
          Importing the Striver A-Z sheet (455 problems across 19 topics). This only happens once.
        </p>
      </div>
    );
  }

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground gap-3">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        Loading sheet…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <button onClick={refresh} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">
          Retry
        </button>
      </div>
    );
  }

  const handleToggleStatus = (row: DSASheetRow) => {
    const nextStatus = 
      row.status === 'unsolved' ? 'attempted' :
      row.status === 'attempted' ? 'solved' :
      row.status === 'solved' ? 'revision' : 'unsolved';
      
    updateProgress(row.progress_id, { status: nextStatus });
    
    // Keep drawer in sync if it's currently open
    if (activeRow?.progress_id === row.progress_id) {
      setActiveRow({ ...activeRow, status: nextStatus });
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">

      {/* Heatmap */}
      {summary && <DSATopicHeatmap summary={summary} />}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-card border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
          >
            <option value="">All Statuses</option>
            <option value="unsolved">Unsolved</option>
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
            <option value="revision">Need Revision</option>
          </select>
        </div>
      </div>

      {/* Topic List */}
      <div className="space-y-4 pb-20">
        {topicGroups.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground glass rounded-xl border border-border">
            {statusFilter || searchQuery
              ? 'No problems match your current filters.'
              : 'No problems found. Try refreshing the page.'}
          </div>
        ) : (
          topicGroups.map((group, i) => (
            <DSATopicGroup
              key={group.topic}
              group={group}
              onRowClick={setActiveRow}
              onToggleStatus={handleToggleStatus}
              defaultExpanded={i === 0}
            />
          ))
        )}
      </div>

      {/* Flyout Drawer */}
      {activeRow && (
        <DSAProblemDrawer
          row={activeRow}
          isOpen={!!activeRow}
          onClose={() => setActiveRow(null)}
          onUpdate={updateProgress}
        />
      )}
    </div>
  );
}
