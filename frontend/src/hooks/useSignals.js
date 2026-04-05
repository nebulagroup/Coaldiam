import { useState, useEffect, useCallback } from 'react';
import { fetchSignals } from '../lib/api';

export function useSignals(params = {}) {
  const [data, setData] = useState({ signals: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSignals(params);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { ...data, loading, error, refetch: load };
}
