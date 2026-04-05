export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value) => {
  if (value === null || value === undefined) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getDirectionColor = (direction) =>
  direction === 'bullish' ? 'var(--color-bullish)' : 'var(--color-bearish)';

export const getDirectionBg = (direction) =>
  direction === 'bullish' ? 'var(--color-bullish-dim)' : 'var(--color-bearish-dim)';

export const getScoreColor = (score) => {
  if (score >= 80) return '#00C853';
  if (score >= 60) return '#f59e0b';
  return '#FF1744';
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#3b82f6';
    case 'hit_target': return '#00C853';
    case 'hit_stop': return '#FF1744';
    case 'expired': return '#64748b';
    default: return '#94a3b8';
  }
};

export const getStrategyLabel = (strategy) => {
  const labels = {
    momentum_breakout: 'Momentum Breakout',
    mean_reversion: 'Mean Reversion',
    options_flow: 'Options Flow',
    gemini_pattern: 'Gemini AI Pattern',
  };
  return labels[strategy] || strategy;
};

export const getStrategyIcon = (strategy) => {
  const icons = {
    momentum_breakout: '⚡',
    mean_reversion: '🔄',
    options_flow: '📊',
    gemini_pattern: '🤖',
  };
  return icons[strategy] || '📈';
};
