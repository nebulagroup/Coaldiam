import { useState, useEffect } from 'react';

import SignalCard from '../components/SignalCard';
import PnLCard from '../components/PnLCard';
import SignalTable from '../components/SignalTable';
import SkeletonLoader from '../components/SkeletonLoader';
import { useSignals } from '../hooks/useSignals';
import { fetchPerformance, generateSignals } from '../lib/api';

export default function Dashboard() {
  const { signals: activeSignals, loading: signalsLoading } = useSignals({ status: 'active', limit: 6 });
  const { signals: historySignals, loading: historyLoading } = useSignals({ limit: 10 });
  const [performance, setPerformance] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPerformance().then(setPerformance).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateSignals(['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMZN']);
    } catch (e) {
      console.error('Generate error:', e);
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-12 pb-10">
      
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border)] animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-cyan)]"></span>
            SYSTEM ARCHITECTURE v1.0
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">
            Quantitative Intelligence.
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-xl font-medium tracking-tight">
            Real-time algorithmic trading signals powered by Gemini 1.5 Flash.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="group relative px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-50 overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-purple)] opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center gap-2">
            {generating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Run AI Scrape
              </>
            )}
          </div>
        </button>
      </div>

      {/* Primary Telemetry Grid - Redesigned without giant chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-[slideUp_0.6s_ease-out_forwards]">
        
        {/* Market Movers & Insights (Left side 3/4) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Market Movers */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <h3 className="text-sm font-bold tracking-tight text-[var(--color-text-secondary)] uppercase mb-4">Volume Anomalies</h3>
            <div className="space-y-4 flex-1">
              {[
                { ticker: 'NVDA', change: '+4.2%', vol: '2.1x', bullish: true },
                { ticker: 'TSLA', change: '-3.1%', vol: '1.8x', bullish: false },
                { ticker: 'AAPL', change: '+1.5%', vol: '1.2x', bullish: true },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)]">
                  <span className="font-bold text-[var(--color-text-primary)]">{m.ticker}</span>
                  <div className="flex gap-4">
                    <span className="text-xs text-[var(--color-text-muted)] mt-0.5">Vol: {m.vol}</span>
                    <span className={`font-semibold ${m.bullish ? 'text-[var(--color-bullish)]' : 'text-[var(--color-bearish)]'}`}>{m.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div className="glass-card p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-[var(--color-purple)]">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-sm font-bold tracking-tight text-[var(--color-purple)] uppercase mb-4 relative z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-purple)] animate-pulse"></span>
              Neural Insight
            </h3>
            <div className="space-y-3 relative z-10 flex-1">
              <p className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] leading-snug">
                Put/Call skew on SPY is reaching 3-month extremes.
              </p>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Institutional sweepers have aggressively positioned for downside protection over the last 48 hours. Historically, when this divergence hits a 3.2 z-score, we see a mean reversion bounce within 2 sessions 74% of the time.
              </p>
            </div>
          </div>

        </div>

        {/* PnL Card (Right side 1/4) */}
        <div className="lg:col-span-1">
          <PnLCard performance={performance} />
        </div>
      </div>

      {/* Active Signals Grid */}
      <div className="animate-[slideUp_0.7s_ease-out_forwards]">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold tracking-tight">Active Deployments</h2>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
            {activeSignals?.length || 0}
          </span>
        </div>
        
        {signalsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <SkeletonLoader key={i} type="card" />)}
          </div>
        ) : activeSignals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {activeSignals.map((signal, idx) => (
              <SignalCard key={signal.id || idx} signal={signal} index={idx} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center rounded-2xl border-dashed border-[var(--color-border)]">
            <svg className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <h3 className="text-lg font-semibold text-white mb-1">Systems Idle</h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto">No active signals found in the market. Click 'Run AI Scrape' to initiate a scan across all configured strategies.</p>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="pt-6 animate-[slideUp_0.8s_ease-out_forwards]">
        <h2 className="text-xl font-bold tracking-tight mb-6">Recent History Overview</h2>
        <div className="glass-card shadow-2xl overflow-hidden">
          <SignalTable
            signals={historySignals || []}
            loading={historyLoading}
            total={10}
            limit={10}
            offset={0}
          />
        </div>
      </div>
    </div>
  );
}
