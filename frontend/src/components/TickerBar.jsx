import { usePrices } from '../hooks/usePrices';
import { formatCurrency, formatPercent } from '../lib/utils';

export default function TickerBar() {
  const { prices, loading } = usePrices(5000);

  if (loading) return null;

  return (
    <div className="h-7 bg-[var(--color-bg-primary)] border-t border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center h-full animate-[ticker_30s_linear_infinite] whitespace-nowrap">
        {[...prices, ...prices].map((p, idx) => (
          <div
            key={`${p.symbol}-${idx}`}
            className="flex items-center gap-1.5 px-4 h-full"
          >
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">{p.symbol}</span>
            <span className="text-[10px] font-medium text-[var(--color-text-primary)]">
              {formatCurrency(p.price)}
            </span>
            <span
              className="text-[10px]"
              style={{ color: p.change >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}
            >
              {formatPercent(p.change_percent)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
