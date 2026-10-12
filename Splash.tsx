import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { Bubbles, GlobeHero, Logo } from '../components/Illustrations';

export default function Splash() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/learn" replace />;
  return (
    <div className="relative min-h-screen bg-brand overflow-hidden flex flex-col items-center justify-center px-6 py-8 text-white">
      <Bubbles />
      <div className="relative flex items-center gap-3 animate-pop">
        <Logo size={68} />
        <h1 className="text-4xl sm:text-5xl font-bold drop-shadow">SpeakSphere</h1>
      </div>
      <p className="relative mt-1 opacity-90">Speak any language with confidence 🌍</p>
      <GlobeHero className="relative w-full max-w-sm mt-2" />
      <h2 className="relative text-2xl font-semibold text-center">Learn a language by speaking, a few minutes a day</h2>
      <div className="relative mt-6 flex flex-col items-center gap-3 w-full max-w-xs">
        <Link to="/signup" className="crystal-btn crystal-btn-light w-full">🚀 Start learning</Link>
      </div>
    </div>
  );
}
