import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Layout
import AppShell from './components/layout/AppShell';

// Pages
import Dashboard    from './pages/dashboard';
import Analyzer     from './pages/analyzer';
import Calculators  from './pages/calculators';
import ProgressPage from './pages/progress';
import AuthPage     from './pages/auth';
import Contact      from './pages/Contact';
import About        from './pages/About';
import BillingPage  from './pages/billing';

// Features
import GoalPlanner from './components/GoalPlanner/goalplanner';

// Calculators
import TdeeCalculator      from './calculators/TdeeCalculator';
import ProteinCalculator   from './calculators/ProteinCalculator';
import OneRepMaxCalculator from './calculators/OneRepMaxCalculator';

// Exercises
import ExerciseLibrary from './pages/ExerciseLibrary/ExerciseLibrary';
import ExerciseDetails from './pages/ExerciseLibrary/ExerciseDetails';

// Workouts
import WorkoutLogger from './pages/Workouts/WorkoutLogger';

// Upgrade context
import { UpgradeProvider } from './context/UpgradeContext';

// Global theme
import './styles/theme.css';

function ProtectedRoute({ session, loading, children }) {
  if (loading) {
    return (
      <div style={{ color: '#9aa0a6', textAlign: 'center', marginTop: '100px' }}>
        Loading…
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const navigate = useNavigate();

  // Fetch subscription tier from profiles table
  async function fetchTier(userId) {
    if (!userId) { setIsPro(false); return; }
    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .maybeSingle();
    setIsPro(data?.subscription_tier === 'pro');
  }

  useEffect(() => {
    const getSession = async () => {
      const fallback = setTimeout(() => setLoading(false), 5000);
      try {
        const { data } = await supabase.auth.getSession();
        const sess = data?.session ?? null;
        setSession(sess);
        await fetchTier(sess?.user?.id);
      } catch (err) {
        console.error('Session error:', err);
      } finally {
        clearTimeout(fallback);
        setLoading(false);
      }
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      fetchTier(sess?.user?.id).catch(() => {}).finally(() => setLoading(false));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate('/auth');
  };

  const shell = (child) => (
    <AppShell session={session} onLogout={handleLogout} isPro={isPro}>
      {child}
    </AppShell>
  );

  const protect = (child) => (
    <ProtectedRoute session={session} loading={loading}>
      {shell(child)}
    </ProtectedRoute>
  );

  return (
    <UpgradeProvider>
    <Routes>
      {/* Public */}
      <Route path="/auth"  element={<AuthPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/help"  element={<Contact />} />

      {/* Protected — all inside AppShell */}
      <Route path="/"                    element={protect(<Dashboard />)} />
      <Route path="/analyzer"            element={protect(<Analyzer isPro={isPro} />)} />
      <Route path="/calculators"         element={protect(<Calculators isPro={isPro} />)} />
      <Route path="/calculators/tdee"    element={protect(<TdeeCalculator />)} />
      <Route path="/calculators/protein" element={protect(<ProteinCalculator />)} />
      <Route path="/calculators/1rm"     element={protect(<OneRepMaxCalculator />)} />
      <Route path="/goalplanner"         element={protect(<GoalPlanner />)} />
      <Route path="/progress"            element={protect(<ProgressPage />)} />
      <Route path="/workouts"            element={protect(<WorkoutLogger />)} />
      <Route path="/billing"             element={protect(<BillingPage />)} />
      <Route path="/exercises"           element={protect(<ExerciseLibrary />)} />
      <Route path="/exercises/:id"       element={protect(<ExerciseDetails />)} />
    </Routes>
    </UpgradeProvider>
  );
}

export default App;
