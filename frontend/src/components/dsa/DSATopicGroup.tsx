import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { DSATopicGroup as TopicGroupType, DSASheetRow } from '../../types';

interface Props {
  group: TopicGroupType;
  onRowClick: (row: DSASheetRow) => void;
  onToggleStatus: (row: DSASheetRow) => void;
  onToggleDifficulty: (row: DSASheetRow) => void;
  defaultExpanded?: boolean;
}

export function DSATopicGroup({ group, onRowClick, onToggleStatus, onToggleDifficulty, defaultExpanded = false }: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved': return 'text-[#4ADE80] border-[#4ADE80]/30';
      case 'attempted': return 'text-yellow-400 border-yellow-400/30';
      case 'revision': return 'text-[var(--color-arc-cyan)] border-[var(--color-arc-cyan)]/30';
      default: return 'text-white/40 border-white/10';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-[#4ADE80] border-[#4ADE80]/30';
      case 'medium': return 'text-yellow-400 border-yellow-400/30';
      case 'hard': return 'text-red-500 border-red-500/30';
      default: return 'text-white/40 border-white/10';
    }
  };

  return (
    <div className="mb-6 bg-black/60 border border-[var(--color-arc-cyan)]/30 rounded-none overflow-hidden relative shadow-[0_0_15px_rgba(0,212,255,0.1)]">
      {/* Group Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--color-arc-cyan)]/10 transition-colors group relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-arc-cyan)]/50 group-hover:bg-[var(--color-arc-cyan)] transition-colors"></div>
        <div className="flex items-center gap-4">
          <div className="text-[var(--color-arc-cyan)] opacity-70 group-hover:opacity-100 transition-opacity">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          <h3 className="text-xl font-display font-bold tracking-widest text-white uppercase group-hover:text-[var(--color-arc-cyan)] transition-colors drop-shadow-[0_0_5px_rgba(0,0,0,1)]">{group.topic}</h3>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Progress bar miniature */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs font-display font-bold text-[var(--color-arc-cyan)]/70 w-16 text-right tracking-widest">
              {group.solved} / {group.total}
            </span>
            <div className="w-32 h-1.5 bg-black border border-[var(--color-arc-cyan)]/30 overflow-hidden relative">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-[var(--color-arc-cyan)] shadow-[0_0_10px_rgba(0,212,255,0.8)] transition-all duration-700"
                style={{ width: `${(group.solved / group.total) * 100}%` }}
              />
            </div>
          </div>
          
          <span className="px-3 py-1 rounded-sm bg-black border border-[var(--color-arc-cyan)] text-[var(--color-arc-cyan)] text-xs font-display font-bold tracking-widest shadow-[0_0_10px_rgba(0,212,255,0.2)]">
            {Math.round((group.solved / group.total) * 100) || 0}%
          </span>
        </div>
      </button>

      {/* Subtopics & Rows */}
      {isExpanded && (
        <div className="border-t border-[var(--color-arc-cyan)]/30 bg-black/40">
          {group.subtopics.map((sub) => (
            <div key={sub.subtopic} className="border-b border-[var(--color-arc-cyan)]/10 last:border-0">
              {sub.subtopic !== 'General' && (
                <div className="px-8 py-2 bg-[var(--color-arc-cyan)]/5 text-[10px] font-display font-bold text-[var(--color-arc-cyan)] uppercase tracking-widest border-l-2 border-[var(--color-arc-cyan)]/30">
                  {sub.subtopic}
                </div>
              )}
              
              <div className="flex flex-col">
                {sub.rows.map((row) => (
                  <div 
                    key={row.progress_id}
                    onClick={() => onRowClick(row)}
                    className="group/row px-8 py-3 flex items-center justify-between border-b border-[var(--color-arc-cyan)]/5 last:border-0 hover:bg-[var(--color-arc-cyan)]/10 cursor-pointer transition-all hover:pl-10"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-sm font-medium font-mono text-white/80 group-hover/row:text-[var(--color-arc-cyan)] transition-colors truncate">
                        {row.problem.title}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleStatus(row); }}
                          title="Click to cycle status"
                          className={`px-2 py-0.5 rounded-sm border text-[10px] font-display font-bold uppercase tracking-widest bg-black/50 hover:scale-105 transition-transform ${getStatusColor(row.status)}`}
                        >
                          {row.status}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleDifficulty(row); }}
                          title="Click to cycle difficulty"
                          className={`px-2 py-0.5 rounded-sm border text-[10px] font-display font-bold uppercase tracking-widest bg-black/50 hover:scale-105 transition-transform ${getDifficultyColor(row.my_difficulty)}`}
                        >
                          {row.my_difficulty || 'UNRATED'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {row.revision_flag && (
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-display font-bold border border-red-500/50 text-red-400 bg-red-500/10 uppercase tracking-widest">
                          REVISION
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
