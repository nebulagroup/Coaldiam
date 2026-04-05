import { useEffect, useRef, useState, Component } from 'react';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { fetchChartData } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';

const TICKERS = ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMZN'];

class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-[var(--color-bearish)]">Chart failed to render</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-3 py-1 text-xs bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ChartInner() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [selectedTicker, setSelectedTicker] = useState('SPY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let disposed = false;
    let resizeObserver = null;

    // Clean previous chart instance
    if (chartRef.current) {
      try { chartRef.current.remove(); } catch (e) { /* already disposed */ }
      chartRef.current = null;
    }

    const isDark = theme === 'dark';
    const textColor = isDark ? '#a1a1aa' : '#52525b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const crosshairColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    const borderColor = isDark ? '#1e293b' : '#e4e4e7';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 420,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: textColor,
        fontSize: 12,
        fontFamily: 'Inter, -apple-system, sans-serif',
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: crosshairColor, width: 1, style: 3 },
        horzLine: { color: crosshairColor, width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: borderColor,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: borderColor,
        timeVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00C853',
      downColor: '#FF1744',
      borderDownColor: '#FF1744',
      borderUpColor: '#00C853',
      wickDownColor: '#FF1744',
      wickUpColor: '#00C853',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    setLoading(true);
    setError(null);

    fetchChartData(selectedTicker)
      .then(data => {
        // Don't update if already disposed (StrictMode cleanup)
        if (disposed) return;
        if (data && data.length > 0) {
          candleSeries.setData(data.map(d => ({
            time: d.time, open: d.open, high: d.high, low: d.low, close: d.close,
          })));
          volumeSeries.setData(data.map(d => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? '#00C85340' : '#FF174440',
          })));
          chart.timeScale().fitContent();
        }
        setLoading(false);
      })
      .catch(err => {
        if (disposed) return;
        console.error('Chart data fetch error:', err);
        setLoading(false);
        setError(err.message);
      });

    const containerEl = chartContainerRef.current;
    resizeObserver = new ResizeObserver(entries => {
      if (!disposed) {
        for (const entry of entries) {
          chart.applyOptions({ width: entry.contentRect.width });
        }
      }
    });
    resizeObserver.observe(containerEl);

    return () => {
      disposed = true;
      if (resizeObserver) resizeObserver.disconnect();
      try { chart.remove(); } catch (e) { /* already disposed */ }
      chartRef.current = null;
    };
  }, [selectedTicker, theme]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {selectedTicker}
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">Daily</span>
        </div>
        <div className="flex gap-1">
          {TICKERS.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-200 ${
                t === selectedTicker
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-primary)]/80 z-10">
            <div className="text-sm text-[var(--color-text-muted)]">Loading chart...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-primary)]/80 z-10">
            <p className="text-sm text-[var(--color-bearish)]">Chart error: {error}</p>
          </div>
        )}
        <div ref={chartContainerRef} style={{ minHeight: 420 }} />
      </div>
    </div>
  );
}

export default function Chart() {
  return (
    <ChartErrorBoundary>
      <ChartInner />
    </ChartErrorBoundary>
  );
}
