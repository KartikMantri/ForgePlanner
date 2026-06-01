import React, { useState, useEffect } from 'react';
import { Save, Plus, GripVertical, Trash2, Download } from 'lucide-react';
import type { NotePageWithBlocks, NoteBlock } from '../../types';
import { exportNotesToMarkdown } from '../../utils/export';

interface Props {
  page: NotePageWithBlocks;
  onSave: (blocks: any) => void;
}

export function NoteEditor({ page, onSave }: Props) {
  const [blocks, setBlocks] = useState<NoteBlock[]>(page.blocks || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBlocks(page.blocks || []);
  }, [page]);

  const addBlock = (type: string) => {
    const newBlock: NoteBlock = {
      id: `temp-${Date.now()}`,
      page_id: page.id,
      type,
      content: { text: '' },
      sort_order: blocks.length,
      created_at: new Date().toISOString()
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index: number, text: string) => {
    const newBlocks = [...blocks];
    newBlocks[index].content = { text };
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    setSaving(true);
    // Strip temp ids
    const payload = {
      blocks: blocks.map((b, i) => ({
        type: b.type,
        content: b.content,
        sort_order: i
      }))
    };
    await onSave(payload);
    setSaving(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-[var(--color-arc-cyan)]/30 flex-wrap gap-4 bg-gradient-to-r from-[var(--color-arc-cyan)]/10 to-transparent">
        <h2 className="text-2xl font-bold truncate font-display tracking-wide text-[var(--color-arc-cyan)] drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]">{page.title}</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportNotesToMarkdown({ ...page, blocks })}
            className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-[var(--color-arc-cyan)]/30 text-[var(--color-arc-cyan)] hover:bg-[var(--color-arc-cyan)]/20 hover:border-[var(--color-arc-cyan)] rounded font-display tracking-widest transition text-xs"
            title="Export to Markdown"
          >
            <Download className="w-4 h-4" /> EXPORT
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--color-arc-cyan)]/10 text-[var(--color-arc-cyan)] border border-[var(--color-arc-cyan)] hover:bg-[var(--color-arc-cyan)] hover:text-black rounded font-display tracking-widest font-bold transition-all text-xs shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'UPLOADING...' : 'SAVE LOG'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-[var(--color-arc-cyan)]/90">

        {blocks.length === 0 ? (
          <div className="text-center text-[var(--color-arc-cyan)]/40 p-12 font-display tracking-widest text-sm">
            NO DATA IN RECORD. INITIALIZE A BLOCK BELOW.
          </div>
        ) : (
          blocks.map((block, i) => (
            <div key={block.id} className="flex gap-3 group items-start relative">
              <div className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 p-1 cursor-grab text-[var(--color-arc-cyan)]/50 hover:text-[var(--color-arc-cyan)] transition-opacity">
                <GripVertical className="w-4 h-4" />
              </div>
              
              {block.type === 'heading' && (
                <input 
                  value={block.content.text || ''}
                  onChange={(e) => updateBlock(i, e.target.value)}
                  placeholder="LOG HEADER..."
                  className="flex-1 text-xl font-bold bg-transparent focus:outline-none focus:ring-0 border-b border-transparent focus:border-[var(--color-arc-cyan)] px-2 py-1 font-display tracking-wide text-[var(--color-arc-cyan)] placeholder:text-[var(--color-arc-cyan)]/30"
                />
              )}
              {block.type === 'text' && (
                <textarea 
                  value={block.content.text || ''}
                  onChange={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                    updateBlock(i, e.target.value);
                  }}
                  ref={(el) => {
                    if (el) {
                      el.style.height = 'auto';
                      el.style.height = `${el.scrollHeight}px`;
                    }
                  }}
                  placeholder="ENTER DATA..."
                  className="flex-1 text-sm bg-transparent focus:outline-none focus:ring-0 resize-none min-h-[40px] border border-transparent focus:border-[var(--color-arc-cyan)]/50 rounded bg-black/20 focus:bg-black/40 px-3 py-2 overflow-hidden text-[var(--color-arc-cyan)]/80 placeholder:text-[var(--color-arc-cyan)]/30"
                />
              )}
              {block.type === 'code' && (
                <div className="flex-1 relative group/code">
                  <div className="absolute -top-3 left-3 px-2 text-[10px] bg-black text-[var(--color-arc-cyan)]/60 font-display tracking-widest border border-[var(--color-arc-cyan)]/30">SYSTEM.CODE</div>
                  <textarea 
                    value={block.content.text || ''}
                    onChange={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                      updateBlock(i, e.target.value);
                    }}
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = `${el.scrollHeight}px`;
                      }
                    }}
                    placeholder="// EXECUTE PROTOCOL"
                    className="w-full text-sm font-mono bg-black/60 focus:outline-none border border-[var(--color-arc-cyan)]/30 focus:border-[var(--color-arc-cyan)] rounded p-4 pt-5 resize-none min-h-[80px] overflow-hidden text-[#4ADE80] placeholder:text-[var(--color-arc-cyan)]/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
                  />
                </div>
              )}

              <button 
                onClick={() => removeBlock(i)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/20 rounded transition-all mt-1 border border-transparent hover:border-red-500/50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}

        {/* Add Block Menu */}
        <div className="pt-12 pb-8 flex items-center justify-center gap-6 opacity-30 hover:opacity-100 transition-opacity">
          <button onClick={() => addBlock('heading')} className="flex items-center gap-2 text-xs font-bold font-display tracking-widest text-[var(--color-arc-cyan)] border border-[var(--color-arc-cyan)]/50 px-4 py-2 rounded hover:bg-[var(--color-arc-cyan)]/20 hover:shadow-[0_0_10px_rgba(0,212,255,0.3)] transition-all">
            <Plus className="w-3 h-3" /> HEADER
          </button>
          <button onClick={() => addBlock('text')} className="flex items-center gap-2 text-xs font-bold font-display tracking-widest text-[var(--color-arc-cyan)] border border-[var(--color-arc-cyan)]/50 px-4 py-2 rounded hover:bg-[var(--color-arc-cyan)]/20 hover:shadow-[0_0_10px_rgba(0,212,255,0.3)] transition-all">
            <Plus className="w-3 h-3" /> DATA
          </button>
          <button onClick={() => addBlock('code')} className="flex items-center gap-2 text-xs font-bold font-display tracking-widest text-[var(--color-arc-cyan)] border border-[var(--color-arc-cyan)]/50 px-4 py-2 rounded hover:bg-[var(--color-arc-cyan)]/20 hover:shadow-[0_0_10px_rgba(0,212,255,0.3)] transition-all">
            <Plus className="w-3 h-3" /> SCRIPT
          </button>
        </div>
      </div>
    </div>
  );
}
