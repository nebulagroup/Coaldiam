import { formatCurrency, getScoreColor, getStrategyLabel, getStrategyIcon } from '../lib/utils';

export default function SignalCard({ signal, index = 0 }) {
  const isBullish = signal.direction === 'bullish';
  const dirColor = isBullish ? 'var(--color-bullish)' : 'var(--color-bearish)';
  const dirBg = isBullish ? 'var(--color-bullish-dim)' : 'var(--color-bearish-dim)';
  const scoreColor = getScoreColor(signal.score);

  return (
    <div
      className="glass-card glass-card-hover p-5 animate-[fadeIn_0.5s_ease-out_forwards] opacity-0 flex flex-col justify-between"
      style={{ animationDelay: `${index * 100}ms`, minHeight: '200px' }}
    >
      {/* Top section */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-white">{signal.ticker}</span>
            <div
              className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border"
              style={{ color: dirColor, background: dirBg, borderColor: `${dirColor}30` }}
            >
              {signal.direction}
            </div>
          </div>
          
          {/* Hexagonal structural score badge */}
          <div className="relative group cursor-help">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-tertiary)] to-[var(--color-bg-primary)] blur-sm rounded-lg"></div>
            <div className="relative px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-center shadow-inner">
              <span className="text-base font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${scoreColor}, #fff)` }}>
                {signal.score}
              </span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-[var(--color-border)] shadow-xl">
              AI Confidence Score
            </div>
          </div>
        </div>

        {/* Strategy Meta */}
        <div className="flex items-center gap-2 mb-4">
           <div className="w-6 h-6 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center text-[10px]">
             {getStrategyIcon(signal.strategy)}
           </div>
           <span className="text-[11px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
             {getStrategyLabel(signal.strategy)}
           </span>
        </div>

        {/* Thesis */}
        <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed line-clamp-3 mb-5 font-medium">
          {signal.thesis}
        </p>
      </div>

      {/* Bottom section (Prices + Options Play) */}
      <div className="pt-4 border-t border-[var(--color-border)] mt-auto">
        
        {signal.options_play && (
          <div className="mb-3 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--color-purple-dim)] border border-[var(--color-purple)]/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
            <svg className="w-3.5 h-3.5 text-[var(--color-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="text-[11px] font-bold text-[var(--color-purple)] tracking-wide">{signal.options_play}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center bg-[var(--color-bg-secondary)] rounded-lg p-2 border border-[var(--color-border)]">
          <div className="flex flex-col border-r border-[var(--color-border)]">
            <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-0.5">Entry</span>
            <span className="text-sm font-mono text-white">{formatCurrency(signal.entry_price)}</span>
          </div>
          <div className="flex flex-col border-r border-[var(--color-border)]">
            <span className="text-[9px] uppercase tracking-wider text-[var(--color-bullish)] font-semibold mb-0.5">Target</span>
            <span className="text-sm font-mono text-[var(--color-bullish)]">{formatCurrency(signal.target_price)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-[var(--color-bearish)] font-semibold mb-0.5">Stop</span>
            <span className="text-sm font-mono text-[var(--color-bearish)]">{formatCurrency(signal.stop_loss)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
