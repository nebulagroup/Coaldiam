export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-24 animate-[fadeIn_0.6s_ease-out_forwards]">
      
      {/* Hero */}
      <section className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gradient-accent">
          coaldiam
        </h1>
        <p className="text-xl md:text-2xl text-[var(--color-text-primary)] font-medium max-w-2xl mx-auto leading-tight tracking-tight">
          Institutional-grade quantitative analysis. <br className="hidden md:block"/>
          Now open source and accessible to everyone.
        </p>
        <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed text-lg">
          We built coaldiam because the retail trading industry is fundamentally broken. Platforms lock simple moving average crossovers behind $80/month subscriptions and black-box marketing. We believe true edge comes from transparency, mathematical rigor, and unhindered access to high-performance compute.<br/><br/>
          More importantly, we believe in taking raw, chaotic market noise (coal) and applying extreme algorithmic pressure to forge pristine, actionable alpha (diamonds). Hence: <strong>coaldiam</strong>. (Yes, really).
        </p>
      </section>

      {/* The Problem / Solution Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Legacy Systems (Problem) */}
        <div className="glass-card p-8 bg-gradient-to-b from-[var(--color-bg-tertiary)] to-[var(--color-bg-primary)] border-t border-[var(--color-bearish-dim)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded bg-[var(--color-bearish-dim)] flex items-center justify-center text-[var(--color-bearish)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">Legacy Blackboxes</h3>
          </div>
          <ul className="space-y-4">
            {[
              "Expensive subscriptions ($50-100/mo)",
              "Hidden underlying logic and triggers",
              "Unverifiable historical performance",
              "Creators profit from subs, not trading"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[var(--color-text-secondary)]">
                <span className="mt-1 text-[var(--color-bearish)]">✕</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* coaldiam (Solution) */}
        <div className="glass-card p-8 bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)] border-t border-[var(--color-cyan)] shadow-[0_-10px_30px_rgba(6,182,212,0.1)] hover:-translate-y-2 transition-transform duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded bg-[var(--color-cyan)]/20 flex items-center justify-center text-[var(--color-cyan)] shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">coaldiam Architecture</h3>
          </div>
          <ul className="space-y-4">
               {[
              "100% free and open source",
              "Mathematical strategy transparency",
              "Live public paper-trading ledger",
              "Next-gen Gemini 1.5 Flash integration"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[var(--color-text-secondary)]">
                <span className="mt-1 text-[var(--color-cyan)]">✓</span>
                <span className="font-medium text-white">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tech Stack section */}
      <section className="text-center space-y-12">
        <h2 className="text-2xl font-bold tracking-tight text-white">The Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="glass-card p-6 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
            <div className="text-3xl">⚛️</div>
            <p className="font-bold text-sm text-white">React + Vite</p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Frontend Engine</p>
          </div>

          <div className="glass-card p-6 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
            <div className="text-3xl">⚡</div>
            <p className="font-bold text-sm text-white">FastAPI</p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Backend API</p>
          </div>

          <div className="glass-card p-6 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
            <div className="text-3xl">🧠</div>
            <p className="font-bold text-sm text-white">Google Gemini</p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Neural Scorer</p>
          </div>

          <div className="glass-card p-6 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform">
            <div className="text-3xl">📊</div>
            <p className="font-bold text-sm text-white">TradingView</p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Telemetry Core</p>
          </div>
          
        </div>
      </section>
    </div>
  );
}
