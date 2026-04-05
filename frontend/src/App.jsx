import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Signals from './pages/Signals';
import Strategies from './pages/Strategies';
import Monetization from './pages/Monetization';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center text-[var(--color-text-muted)]">Checking clearance...</div>;
  if (!token) return <Navigate to="/login" replace />;
  
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <div className="bg-[var(--color-bg-primary)] min-h-screen text-[var(--color-text-primary)]">
                <Login />
              </div>
            } />
            <Route path="/register" element={
              <div className="bg-[var(--color-bg-primary)] min-h-screen text-[var(--color-text-primary)]">
                <Register />
              </div>
            } />
            <Route element={<Layout />}>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/signals" element={<ProtectedRoute><Signals /></ProtectedRoute>} />
              <Route path="/strategies" element={<ProtectedRoute><Strategies /></ProtectedRoute>} />
              <Route path="/monetization" element={<ProtectedRoute><Monetization /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
