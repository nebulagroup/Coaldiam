export default function ExportCSV({ signals, filename = 'signalos_signals' }) {
  const handleExport = () => {
    if (!signals || signals.length === 0) return;

    const headers = [
      'ID', 'Ticker', 'Strategy', 'Direction', 'Score',
      'Entry Price', 'Target Price', 'Stop Loss',
      'Options Play', 'Thesis', 'Status', 'Created At',
    ];

    const rows = signals.map(s => [
      s.id, s.ticker, s.strategy, s.direction, s.score,
      s.entry_price, s.target_price, s.stop_loss,
      `"${(s.options_play || '').replace(/"/g, '""')}"`,
      `"${(s.thesis || '').replace(/"/g, '""')}"`,
      s.status, s.created_at,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-glow)] transition-all"
    >
      <span>📥</span>
      Export CSV
    </button>
  );
}
