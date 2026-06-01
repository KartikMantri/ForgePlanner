import React, { useState } from 'react';
import { X, ExternalLink, Lightbulb, CheckCircle2, Video, Edit3, Sparkles, Send } from 'lucide-react';
import type { DSASheetRow, DSAProgressUpdate } from '../../types';
import { dsaApi } from '../../services/api';

interface Props {
  row: DSASheetRow;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (progressId: string, update: DSAProgressUpdate) => Promise<void>;
}

export function DSAProblemDrawer({ row, isOpen, onClose, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'ai'>('details');
  const [notes, setNotes] = useState(row.problem.title + ' approach notes...\n'); // In a real app this comes from DB
  const [saving, setSaving] = useState(false);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStatusChange = async (status: 'unsolved' | 'attempted' | 'solved' | 'revision') => {
    setSaving(true);
    await onUpdate(row.progress_id, { status });
    setSaving(false);
  };

  const getHint = async () => {
    setAiLoading(true);
    try {
      const { hint } = await dsaApi.getHint(row.progress_id);
      setAiResponse(hint);
      setActiveTab('ai');
    } catch (e: any) {
      setAiResponse("Failed to connect to AI service: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const getReview = async () => {
    setAiLoading(true);
    try {
      const { review } = await dsaApi.reviewApproach(row.progress_id);
      setAiResponse(review);
      setActiveTab('ai');
    } catch (e: any) {
      setAiResponse("Failed to connect to AI service: " + e.message);
    } finally {
      setAiLoading(false);
    }
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

          {/* Tabs */}
          <div className="flex border-b border-border mt-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Edit3 className="w-4 h-4" /> Approach & Notes
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ai' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-muted-foreground hover:text-indigo-400'}`}
            >
              <Sparkles className="w-4 h-4" /> AI Assistant
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeTab === 'details' ? (
              <div className="flex-1 flex flex-col gap-4">
                <textarea 
                  className="flex-1 w-full bg-muted/30 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Write your approach, space/time complexities, and key insights here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button className="py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save Notes
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-2">
                  <button onClick={getHint} disabled={aiLoading} className="flex-1 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 font-medium rounded-lg text-sm transition flex items-center justify-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Get Nudge Hint
                  </button>
                  <button onClick={getReview} disabled={aiLoading} className="flex-1 py-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border border-purple-500/20 font-medium rounded-lg text-sm transition flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Review Approach
                  </button>
                </div>

                <div className="flex-1 bg-muted/30 border border-border rounded-lg p-4 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {aiLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <Sparkles className="w-6 h-6 animate-pulse text-indigo-400" />
                      Consulting Forge AI...
                    </div>
                  ) : aiResponse ? (
                    aiResponse
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center px-6">
                      Click 'Get Nudge Hint' if you are stuck, or 'Review Approach' to have AI grade your notes.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </>
  );
}
