import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchPrices = () => api.get('/prices').then(r => r.data.prices);

export const fetchSignals = (params = {}) =>
  api.get('/signals', { params }).then(r => r.data);

export const generateSignals = (tickers, timeframe = '1d') =>
  api.post('/generate-signals', { tickers, timeframe }).then(r => r.data);

export const fetchPerformance = () =>
  api.get('/performance').then(r => r.data);

export const fetchChartData = (ticker) =>
  api.get(`/chart-data/${ticker}`).then(r => r.data.data);

export const fetchPaperTrades = (params = {}) =>
  api.get('/paper-trades', { params }).then(r => r.data);

export default api;
