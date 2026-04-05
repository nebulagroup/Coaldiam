import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passphrases do not match');
    }
    setError('');
    setLoading(true);

    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-[fadeIn_0.5s_ease-out_forwards]">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[var(--color-cyan)]/20 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-[var(--color-bullish)]/20 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Request Clearance</h1>
            <p className="text-[var(--color-text-muted)] mt-2">Initialize a new operative profile.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-[var(--color-bearish-dim)]/30 border border-[var(--color-bearish)]/30 text-[var(--color-bearish)] text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase mb-2">Operator Identity (Email)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
                placeholder="new.operator@coaldiam.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase mb-2">Passphrase</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase mb-2">Confirm Passphrase</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative px-6 py-3 rounded-lg font-bold text-sm text-white transition-all duration-300 disabled:opacity-50 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-[0.98] mt-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bullish)] to-[var(--color-cyan)] opacity-90 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex justify-center items-center gap-2">
                {loading ? 'Processing...' : 'Establish Profile'}
              </div>
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Already have an active badge? <Link to="/login" className="text-[var(--color-accent)] hover:text-[var(--color-bullish)] focus:outline-none transition-colors font-medium">Authenticate</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
