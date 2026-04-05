import { useEffect, useRef, Component } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import { formatCurrency } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

class PnLChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-xs text-[var(--color-text-muted)] p-2 text-center mt-4">Chart unavailable</div>;
    }
    return this.props.children;
  }
}

function PnLChart({ performance, theme }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !performance?.daily_pnl?.length) return;

    let disposed = false;

    if (chartInstance.current) {
      try { chartInstance.current.remove(); } catch (e) { /* already disposed */ }
      chartInstance.current = null;
    }

    const isDark = theme === 'dark';
    const textColor = isDark ? '#71717a' : '#a1a1aa';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 160,
      layout: {
        background: { color: 'transparent' },
        textColor: textColor,
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: gridColor, style: 1 },
      },
      rightPriceScale: { 
         visible: false,
         borderVisible: false,
      },
      timeScale: { 
         visible: false,
         borderVisible: false,
      },
      crosshair: { mode: 0 },
      handleScroll: false,
      handleScale: false,
    });

    chartInstance.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: performance.cumulative_pnl >= 0 ? '#10b981' : '#ef4444',
      topColor: performance.cumulative_pnl >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      bottomColor: 'transparent',
      lineWidth: 2,
    });

    areaSeries.setData(
      performance.daily_pnl.map(d => ({ time: d.date, value: d.pnl }))
    );

    chart.timeScale().fitContent();

    const containerEl = chartRef.current;
    const ro = new ResizeObserver(entries => {
      if (!disposed) {
        for (const e of entries) chart.applyOptions({ width: e.contentRect.width });
      }
    });
    ro.observe(containerEl);

    return () => {
      disposed = true;
      ro.disconnect();
      try { chart.remove(); } catch (e) { /* already disposed */ }
      chartInstance.current = null;
    };
  }, [performance, theme]);

  return <div ref={chartRef} className="w-full mt-4" style={{ minHeight: 160 }} />;
}

export default function PnLCard({ performance }) {
  const { theme } = useTheme();

  if (!performance) return null;

  const pnlPositive = performance.cumulative_pnl >= 0;

  return (
    <div className="glass-card flex flex-col h-full bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] overflow-hidden relative group">
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-cyan)] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>

      <div className="p-6 pb-2 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/40 relative z-10">
        <h3 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-4">
          Paper Trading System
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Cumulative Net P&L</p>
            <p className={`text-4xl tracking-tighter font-bold shadow-sm ${pnlPositive ? 'text-[var(--color-bullish)]' : 'text-[var(--color-bearish)]'}`}>
              {pnlPositive ? '+' : ''}{formatCurrency(performance.cumulative_pnl)}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pb-2">
            <div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)] mb-1">Win Rate</p>
              <p className="text-xl font-bold text-white tracking-tight">
                {performance.win_rate}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-muted)] mb-1">Signals</p>
              <p className="text-xl font-bold text-white tracking-tight">
                {performance.total_signals}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-10 bg-[var(--color-bg-card)] px-4 border-t border-[var(--color-border)]">
        <PnLChartErrorBoundary>
          <PnLChart performance={performance} theme={theme} />
        </PnLChartErrorBoundary>
      </div>
    </div>
  );
}
