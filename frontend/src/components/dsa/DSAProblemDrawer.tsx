import React, { useState } from 'react';
import { X, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { DSASheetRow, DSAProgressUpdate } from '../../types';

interface Props {
  row: DSASheetRow;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (progressId: string, update: DSAProgressUpdate) => Promise<void>;
}

export function DSAProblemDrawer({ row, isOpen, onClose, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = async (status: 'unsolved' | 'attempted' | 'solved' | 'revision') => {
    setSaving(true);
    await onUpdate(row.progress_id, { status });
    setSaving(false);
  };

  const handleDifficultyChange = async (my_difficulty: 'easy' | 'medium' | 'hard') => {
    setSaving(true);
    await onUpdate(row.progress_id, { my_difficulty });
    setSaving(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right-full duration-300">

        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {row.problem.sheet_topic} &gt; {row.problem.sheet_subtopic || 'General'}
            </div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {row.problem.title}
              {row.status === 'solved' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* Action Row */}
          <div className="flex gap-3">
            {row.problem.platform_link && (
              <a href={row.problem.platform_link} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition">
                <ExternalLink className="w-4 h-4" /> Solve on LeetCode
              </a>
            )}
          </div>

          {/* Status Toggles */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Update Status</h3>
            <div className="grid grid-cols-4 gap-2 bg-muted p-1 rounded-lg">
              {['unsolved', 'attempted', 'solved', 'revision'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s as any)}
                  disabled={saving}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md capitalize transition-colors ${
                    row.status === s
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Difficulty</h3>
            <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-lg">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  disabled={saving}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md capitalize transition-colors ${
                    row.my_difficulty === d
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
