import { useState, useEffect, useRef } from 'react';
import { fetchPrices } from '../lib/api';

export function usePrices(interval = 5000) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPrices();
        setPrices(data);
        setLoading(false);
      } catch (e) {
        console.error('Price fetch error:', e);
      }
    };

    load();
    timerRef.current = setInterval(load, interval);
    return () => clearInterval(timerRef.current);
  }, [interval]);

  return { prices, loading };
}
