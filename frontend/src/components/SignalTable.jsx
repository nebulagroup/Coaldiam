import { useState, Fragment } from 'react';
import { formatCurrency, formatDate, getScoreColor, getStatusColor, getStrategyLabel, getStrategyIcon } from '../lib/utils';
import SkeletonLoader from './SkeletonLoader';

export default function SignalTable({ signals, loading, total, limit, offset, onPageChange }) {
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="skeleton h-5 w-32 rounded" />
        </div>
        <SkeletonLoader type="table" rows={8} />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {['Ticker', 'Strategy', 'Direction', 'Score', 'Entry', 'Target', 'Stop', 'Status', 'Time'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {signals.map((signal) => {
              const isExpanded = expandedId === signal.id;
              const isBullish = signal.direction === 'bullish';
              const dirColor = isBullish ? 'var(--color-bullish)' : 'var(--color-bearish)';
              const dirBg = isBullish ? 'var(--color-bullish-dim)' : 'var(--color-bearish-dim)';

              return (
                <Fragment key={signal.id}>
                  <tr
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : signal.id)}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-[var(--color-text-primary)]">
                      {signal.ticker}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                      {getStrategyIcon(signal.strategy)} {getStrategyLabel(signal.strategy)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ color: dirColor, background: dirBg }}
                      >
                        {signal.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold" style={{ color: getScoreColor(signal.score) }}>
                        {signal.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-primary)]">
                      {formatCurrency(signal.entry_price)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-bullish)]">
                      {formatCurrency(signal.target_price)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-bearish)]">
                      {formatCurrency(signal.stop_loss)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                        style={{
                          color: getStatusColor(signal.status),
                          background: `${getStatusColor(signal.status)}20`,
                        }}
                      >
                        {signal.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[var(--color-text-muted)]">
                      {formatDate(signal.created_at)}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[var(--color-bg-tertiary)]/50">
                      <td colSpan="9" className="px-6 py-4">
                        <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
                          <div>
                            <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1">AI Thesis</h4>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{signal.thesis}</p>
                          </div>
                          {signal.options_play && (
                            <div>
                              <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1">Options Play</h4>
                              <p className="text-sm text-[var(--color-purple)]">🎯 {signal.options_play}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1">Confidence Factors</h4>
                            <div className="flex flex-wrap gap-2">
                              {(signal.confidence_factors || []).map((f, i) => (
                                <span key={i} className="px-2 py-1 bg-[var(--color-accent-dim)] text-[var(--color-accent)] text-[11px] rounded">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-6">
                            <div>
                              <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1">Invalidation</h4>
                              <p className="text-xs text-[var(--color-bearish)]">{signal.invalidation}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-1">Risk/Reward</h4>
                              <p className="text-xs text-[var(--color-text-primary)]">{signal.risk_reward}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)]">
            Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => onPageChange?.(Math.max(0, offset - limit))}
              className="px-3 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] disabled:opacity-30 hover:bg-[var(--color-border)] transition-colors"
            >
              ← Prev
            </button>
            <button
              disabled={offset + limit >= total}
              onClick={() => onPageChange?.(offset + limit)}
              className="px-3 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] disabled:opacity-30 hover:bg-[var(--color-border)] transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
