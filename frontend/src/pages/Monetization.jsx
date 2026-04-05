import PnLCard from '../components/PnLCard';
import { useState, useEffect } from 'react';
import { fetchPerformance } from '../lib/api';

export default function Monetization() {
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    fetchPerformance().then(setPerformance).catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-16 animate-[fadeIn_0.6s_ease-out_forwards]">
      
      {/* Header section */}
      <div className="text-center space-y-6">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-semibold tracking-wide text-[var(--color-purple)] mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-purple)] animate-pulse"></span>
            REVENUE MATRIX
          </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
          The Business Model.
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
          How do we provide institutional-grade trading intelligence for free? 
          Simple: We don't sell shovels; we mine the gold ourselves.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Value Props */}
        <div className="space-y-8">
          <div className="glass-card p-6 flex gap-4 hover:-translate-y-1 transition-transform border-l-4 border-l-[var(--color-accent)]">
            <div className="text-3xl mt-1">1️⃣</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Proprietary Trading (Skin in the Game)</h3>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                Our primary revenue source is trading our own capital based on these exact signals. If the AI doesn't perform, we lose money. We share the signals because the market is massive — your 2 contracts of SPY won't front-run our trades.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 flex gap-4 hover:-translate-y-1 transition-transform border-l-4 border-l-[var(--color-purple)]">
            <div className="text-3xl mt-1">2️⃣</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Institutional API Licensing</h3>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                While the dashboard is free for retail traders, we license our low-latency WebSocket feed and raw AI scoring models to boutique hedge funds and prop firms for their algorithmic execution engines.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 flex gap-4 hover:-translate-y-1 transition-transform border-l-4 border-l-[var(--color-cyan)]">
            <div className="text-3xl mt-1">3️⃣</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Anonymized Data Insights</h3>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                We aggregate which signals users click on and paper-trade the most, creating unique retail sentiment indicators. This macro-level anonymized data is valuable to institutional researchers.
              </p>
            </div>
          </div>
        </div>

        {/* Live Proof */}
        <div className="glass-card p-1">
          <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] rounded-t-2xl">
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">Live Proof of Concept</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Real-time unedited performance of the underlying AI models via Paper-Trading execution.</p>
          </div>
          <div className="p-4 bg-[var(--color-bg-primary)] rounded-b-2xl">
             <PnLCard performance={performance} />
          </div>
        </div>
        
      </div>
    </div>
  );
}
