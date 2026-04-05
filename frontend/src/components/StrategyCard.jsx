import { getStrategyIcon } from '../lib/utils';
import WinRateBadge from './WinRateBadge';

export default function StrategyCard({ strategy, index = 0 }) {
  return (
    <div 
      className="glass-card flex flex-col h-full bg-[var(--color-bg-secondary)] overflow-hidden relative group"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-tertiary)] to-[var(--color-bg-primary)] opacity-50 pointer-events-none"></div>

      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)] relative z-10 flex items-start justify-between bg-gradient-to-r from-transparent to-[var(--color-bg-primary)]/40">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] flex items-center justify-center text-lg shadow-inner">
            {getStrategyIcon(strategy.id)}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white mb-1 group-hover:text-[var(--color-cyan)] transition-colors">
              {strategy.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold">Model Architecture</span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]"></span>
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-cyan)] font-semibold">V1.0.4</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 bg-[var(--color-bg-primary)] rounded-full p-1 border border-[var(--color-border)] shadow-inner">
           <WinRateBadge winRate={strategy.winRate} />
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 space-y-6 relative z-10 flex-1">
        
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-[var(--color-cyan)] uppercase tracking-[0.2em]">System Logic</h4>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed font-medium">
            {strategy.description}
          </p>
        </div>

        <div className="space-y-2 border-t border-[var(--color-border)] pt-4">
           <h4 className="text-[10px] font-bold text-[var(--color-cyan)] uppercase tracking-[0.2em]">Execution Theory</h4>
           <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
             {strategy.howItWorks}
           </p>
        </div>

        <div className="space-y-2 border-t border-[var(--color-border)] pt-4">
           <h4 className="text-[10px] font-bold text-[var(--color-cyan)] uppercase tracking-[0.2em]">Optimal Environment</h4>
           <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
             {strategy.bestFor}
           </p>
        </div>
      </div>

      {/* Footer / Risk Factors */}
      <div className="p-4 bg-[var(--color-bg-primary)]/80 border-t border-[var(--color-border)] relative z-10">
        <h4 className="text-[10px] font-bold text-[var(--color-bearish)] uppercase tracking-[0.2em] mb-3">Risk Vectors</h4>
        <div className="flex flex-wrap gap-2">
          {strategy.risks.map((risk, i) => (
            <span 
              key={i} 
              className="px-2 py-1 rounded bg-[var(--color-bearish-dim)]/50 border border-[var(--color-bearish)]/20 text-[10px] text-[var(--color-bearish)] font-medium tracking-wide"
            >
              {risk}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
