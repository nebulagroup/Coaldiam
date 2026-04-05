import StrategyCard from '../components/StrategyCard';

const strategies = [
  {
    id: 'momentum',
    name: 'Momentum Breakout',
    risk: 'High',
    winRate: 67,
    description: 'Detects when price reclaims VWAP with an EMA-9 crossing above EMA-21, accompanied by 2x or greater average volume. This confluence of indicators signals the beginning of a strong directional move driven by institutional buying pressure.',
    howItWorks: 'Rides the early part of institutional momentum moves. When big players enter positions, they create sustained buying that pushes price through key levels. By combining VWAP reclaim with volume confirmation, we enter early in the move before retail traders catch on.',
    bestFor: 'SPY/QQQ 0DTE or 1DTE calls in the first 90 minutes of market open, when institutional order flow is most active and momentum moves are strongest.',
    history: 'Breakout trading works because markets are driven by supply and demand imbalances. When a stock breaks above VWAP with heavy volume, it signals that institutional buyers are overwhelming sellers — a pattern documented extensively in market microstructure research spanning decades.',
    risks: ['Fake breakouts', 'Low-volume environments', 'Choppy/ranging markets', 'News-driven volatility']
  },
  {
    id: 'mean_reversion',
    name: 'Mean Reversion',
    risk: 'Medium',
    winRate: 72,
    description: 'Identifies oversold bounces when RSI drops below 30 and price touches or pierces the lower Bollinger Band (20,2). This statistical extremes combination signals seller exhaustion and a high-probability snap-back to the mean.',
    howItWorks: 'Captures the rubber-band snap when sellers exhaust themselves. After extended selling, stocks become statistically oversold. Historically, stocks that reach RSI < 30 with BB lower touch revert toward the 20-day mean within 2-3 sessions approximately 70% of the time.',
    bestFor: 'Weekly options on large-cap names after 3+ consecutive red days, where the probability of mean reversion is highest and options premium decay works in your favor.',
    history: 'Mean reversion is one of the most well-documented phenomena in quantitative finance. Research from major universities and hedge funds consistently shows that extreme price movements tend to reverse — prices are attracted to their statistical averages like rubber bands.',
    risks: ['Strong trending markets', 'Sector-wide selling events', 'Earnings surprises', 'Macro shocks']
  },
  {
    id: 'options_flow',
    name: 'Options Flow Anomaly',
    risk: 'Medium',
    winRate: 64,
    description: 'Detects unusual call or put volume that exceeds 2x the 30-day average open interest on specific strike prices. This algorithm flags outsized bets that suggest institutional accumulation or insider knowledge before major moves.',
    howItWorks: 'Follows the "smart money." Institutions leave footprints when they build large options positions. By filtering out normal hedging activity and focusing on aggressive out-of-the-money sweeps on the ask, we can ride the coattails of major players.',
    bestFor: 'Swings (1-4 weeks) ahead of potential unannounced catalysts, earnings run-ups, or major sector rotations.',
    history: 'Research on options order flow has shown that aggressive, directional options buying (sweeps) frequently precedes stock price movements. Market makers delta-hedging these large options orders also creates a feedback loop that pushes the underlying stock price in the direction of the flow.',
    risks: ['Hedge positions mistaken for directional bets', 'Low liquidity traps', 'Rapid IV crush (Implied Volatility)']
  },
  {
    id: 'gemini_pattern',
    name: 'Gemini AI Pattern',
    risk: 'Low',
    winRate: 81,
    description: 'Google Gemini 1.5 Flash analyzes multi-timeframe price structure across 15-minute, 1-hour, and daily charts to find complex patterns (head & shoulders, triangles, wedges) that traditional indicators miss.',
    howItWorks: 'Uses multimodal AI to literally "look" at the charts like a human expert, but with infinite patience and consistency. It grades setups based on confluence — requiring alignment across multiple timeframes before issuing a signal.',
    bestFor: 'High-conviction swing trades where technical alignment is perfect. Fewer signals, but much higher historical win rate and strict risk/reward ratios.',
    history: 'While quantitative algorithms struggle with subjective chart patterns (like drawing trendlines or identifying falling wedges), LLMs like Gemini 1.5 have shown remarkable ability in spatial-temporal pattern recognition, bridging the gap between discretionary human trading and algorithmic execution.',
    risks: ['AI hallucinations (rare)', 'Sudden fundamental shifts ignoring technicals', 'Extended consolidation periods']
  }
];

export default function Strategies() {
  return (
    <div className="max-w-5xl mx-auto py-10 space-y-16 animate-[fadeIn_0.6s_ease-out_forwards]">
      
      {/* Header section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
          Transparent Intelligence.
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
          Every signal we deploy is parsed through one of four proprietary strategy models. 
          We expose the exact execution conditions, logic, and historical context of every system. 
          Zero black boxes. Total structural transparency.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] backdrop-blur text-sm flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">Active Models</span>
            <span className="font-bold text-white">4</span>
          </div>
          <div className="px-4 py-2 rounded-full border border-[var(--color-purple-dim)] bg-[var(--color-purple-dim)]/20 text-sm flex items-center gap-2">
            <span className="text-[var(--color-purple)]">Compute Core</span>
            <span className="font-bold text-white">Gemini 1.5 Pro</span>
          </div>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {strategies.map((strategy, idx) => (
          <StrategyCard key={strategy.id} strategy={strategy} index={idx} />
        ))}
      </div>
    </div>
  );
}
