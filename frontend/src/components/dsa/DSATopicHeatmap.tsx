import React from 'react';
import type { DSASheetSummary } from '../../types';

interface Props {
  summary: DSASheetSummary;
}

export function DSATopicHeatmap({ summary }: Props) {
  // Sort topics by total problems descending, or keep them as they are
  const topics = Object.entries(summary.by_topic).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="glass p-6 rounded-xl border border-border mb-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Topic Mastery Heatmap</h2>
          <p className="text-sm text-muted-foreground mt-1">Visualize your progress across all algorithmic topics.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-primary">{summary.percent_solved}%</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Completion</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {topics.map(([topicName, stats]) => {
          // Calculate heat color based on percentage
          let bgClass = 'bg-muted';
          let borderClass = 'border-border';
          let textClass = 'text-muted-foreground';

          if (stats.percent === 100) {
            bgClass = 'bg-green-500/20';
            borderClass = 'border-green-500/50';
            textClass = 'text-green-500 font-medium';
          } else if (stats.percent >= 75) {
            bgClass = 'bg-emerald-500/20';
            borderClass = 'border-emerald-500/40';
            textClass = 'text-emerald-500 font-medium';
          } else if (stats.percent >= 50) {
            bgClass = 'bg-yellow-500/20';
            borderClass = 'border-yellow-500/40';
            textClass = 'text-yellow-500 font-medium';
          } else if (stats.percent > 0) {
            bgClass = 'bg-blue-500/10';
            borderClass = 'border-blue-500/30';
            textClass = 'text-blue-500';
          }

          return (
            <div 
              key={topicName} 
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all hover:scale-105 cursor-default ${bgClass} ${borderClass}`}
              title={`${stats.solved}/${stats.total} solved`}
            >
              <div className="text-xs font-semibold truncate mb-2" title={topicName}>
                {topicName}
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-lg font-bold ${textClass}`}>{stats.percent}%</span>
                <span className="text-[10px] text-muted-foreground/70">{stats.solved}/{stats.total}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
