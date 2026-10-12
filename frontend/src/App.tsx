import { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Layout from './components/Layout';
import Splash from './pages/Splash';
import { ForgotPage, LoginPage, ResetPage, SignupPage } from './pages/Auth';
import { LevelPage, SourcePage, TargetPage } from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Speak from './pages/Speak';
import Chat from './pages/Chat';
import Quiz from './pages/Quiz';
import Progress from './pages/Progress';
import Achievements from './pages/Achievements';

function Loading() {
  return <div className="min-h-screen bg-brand flex items-center justify-center text-white text-xl animate-pulse">🌐 Loading…</div>;
}
function Private({ children, needPrefs = true }: { children: ReactNode; needPrefs?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (needPrefs && (!user.sourceLang || !user.targetLang || !user.level)) return <Navigate to="/source" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot" element={<ForgotPage />} />
      <Route path="/reset" element={<ResetPage />} />
      <Route path="/source" element={<Private needPrefs={false}><SourcePage /></Private>} />
      <Route path="/target" element={<Private needPrefs={false}><TargetPage /></Private>} />
      <Route path="/level" element={<Private needPrefs={false}><LevelPage /></Private>} />
      <Route element={<Private><Layout /></Private>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/speak" element={<Speak />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/achievements" element={<Achievements />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
