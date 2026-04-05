import { useState, useCallback } from 'react';
import SignalTable from '../components/SignalTable';
import ExportCSV from '../components/ExportCSV';
import { useSignals } from '../hooks/useSignals';

const STRATEGIES = [
  { value: '', label: 'All Strategies' },
  { value: 'momentum_breakout', label: 'Momentum Breakout' },
  { value: 'mean_reversion', label: 'Mean Reversion' },
  { value: 'options_flow', label: 'Options Flow' },
  { value: 'gemini_pattern', label: 'Gemini AI Pattern' },
];

export default function Signals() {
  const [filters, setFilters] = useState({
    ticker: '',
    strategy: '',
    direction: '',
    min_score: 0,
    limit: 25,
    offset: 0,
  });

  const params = {};
  if (filters.ticker) params.ticker = filters.ticker;
  if (filters.strategy) params.strategy = filters.strategy;
  if (filters.direction) params.direction = filters.direction;
  if (filters.min_score > 0) params.min_score = filters.min_score;
  params.limit = filters.limit;
  params.offset = filters.offset;

  const { signals, total, loading, error } = useSignals(params);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const handlePageChange = useCallback((newOffset) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  }, []);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Signals</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Full history of AI-generated trading signals
          </p>
        </div>
        <ExportCSV signals={signals} />
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Ticker */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Ticker
            </label>
            <input
              type="text"
              value={filters.ticker}
              onChange={e => updateFilter('ticker', e.target.value.toUpperCase())}
              placeholder="e.g. SPY"
              className="px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] w-24 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            />
          </div>

          {/* Strategy */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Strategy
            </label>
            <select
              value={filters.strategy}
              onChange={e => updateFilter('strategy', e.target.value)}
              className="px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            >
              {STRATEGIES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Direction */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Direction
            </label>
            <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
              {['', 'bullish', 'bearish'].map(dir => (
                <button
                  key={dir}
                  onClick={() => updateFilter('direction', dir)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    filters.direction === dir
                      ? dir === 'bullish'
                        ? 'bg-[var(--color-bullish-dim)] text-[var(--color-bullish)]'
                        : dir === 'bearish'
                        ? 'bg-[var(--color-bearish-dim)] text-[var(--color-bearish)]'
                        : 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                      : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {dir || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Min Score */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Min Score: {filters.min_score}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.min_score}
              onChange={e => updateFilter('min_score', parseInt(e.target.value))}
              className="w-32 accent-[var(--color-accent)]"
            />
          </div>

          {/* Clear */}
          <button
            onClick={() => setFilters({ ticker: '', strategy: '', direction: '', min_score: 0, limit: 25, offset: 0 })}
            className="px-3 py-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-[var(--color-bearish)]">Error loading signals: {error}</p>
        </div>
      ) : (
        <SignalTable
          signals={signals || []}
          loading={loading}
          total={total}
          limit={filters.limit}
          offset={filters.offset}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
