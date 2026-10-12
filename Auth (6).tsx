import { FormEvent, ReactNode, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { Bubbles, Logo, LogoWatermark } from '../components/Illustrations';

// Same blue background as the first (splash) page, with the logo big in the background
function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-brand overflow-hidden flex flex-col items-center justify-center px-4 py-8">
      <Bubbles /><LogoWatermark />
      <Link to="/" className="relative flex items-center gap-3 text-white mb-5 animate-pop">
        <Logo size={56} /><span className="text-3xl sm:text-4xl font-bold drop-shadow">SpeakSphere</span>
      </Link>
      <div className="relative crystal w-full max-w-md p-6 sm:p-8 animate-rise">
        <h2 className="text-2xl font-bold text-center mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}
const Err = ({ msg }: { msg: string }) => (msg ? <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{msg}</p> : null);

function next(user: { sourceLang: string | null; level: string | null }) {
  return user.sourceLang && user.level ? '/learn' : '/source';
}

export function SignupPage() {
  const { signup, user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ username: '', email: '', password: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={next(user)} replace />;
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await signup(f.username, f.email, f.password); nav('/source'); }
    catch (x) { setErr(x instanceof ApiError ? x.message : 'Sign up failed.'); } finally { setBusy(false); }
  }
  return (
    <Shell title="Create your account ✨">
      <form onSubmit={submit} className="space-y-3">
        <input className="crystal-input" placeholder="👤 Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required />
        <input className="crystal-input" type="email" placeholder="✉️ Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        <input className="crystal-input" type="password" placeholder="🔒 Password (min 8 characters)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        <Err msg={err} />
        <button className="crystal-btn w-full" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="text-center text-sm mt-4">Already have an account? <Link className="text-blue-700 font-semibold" to="/login">Log in</Link></p>
    </Shell>
  );
}

export function LoginPage() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [id, setId] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={next(user)} replace />;
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(id, pw); nav('/learn'); }
    catch (x) { setErr(x instanceof ApiError ? x.message : 'Login failed.'); } finally { setBusy(false); }
  }
  return (
    <Shell title="Welcome back 👋">
      <form onSubmit={submit} className="space-y-3">
        <input className="crystal-input" placeholder="✉️ Email or username" value={id} onChange={(e) => setId(e.target.value)} required />
        <input className="crystal-input" type="password" placeholder="🔒 Password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        <Err msg={err} />
        <button className="crystal-btn w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="text-center text-sm mt-4"><Link className="text-blue-700 font-semibold" to="/forgot">Forgot password?</Link></p>
      <p className="text-center text-sm mt-1">New here? <Link className="text-blue-700 font-semibold" to="/signup">Create an account</Link></p>
    </Shell>
  );
}

export function ForgotPage() {
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr('');
    try { setMsg((await api<{ message: string }>('/auth/forgot', { body: { email } })).message); }
    catch (x) { setErr(x instanceof ApiError ? x.message : 'Failed.'); }
  }
  return (
    <Shell title="Reset your password 🔑">
      <form onSubmit={submit} className="space-y-3">
        <input className="crystal-input" type="email" placeholder="✉️ Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Err msg={err} />{msg && <p className="text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">{msg}</p>}
        <button className="crystal-btn w-full">Send reset link</button>
      </form>
      <p className="text-center text-sm mt-4"><Link className="text-blue-700 font-semibold" to="/login">← Back to login</Link></p>
    </Shell>
  );
}

export function ResetPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr('');
    try {
      setMsg((await api<{ message: string }>('/auth/reset', { body: { token: params.get('token'), password: pw } })).message);
      setTimeout(() => nav('/login'), 1500);
    } catch (x) { setErr(x instanceof ApiError ? x.message : 'Failed.'); }
  }
  return (
    <Shell title="Choose a new password 🔒">
      <form onSubmit={submit} className="space-y-3">
        <input className="crystal-input" type="password" placeholder="New password (min 8 characters)" value={pw} onChange={(e) => setPw(e.target.value)} required />
        <Err msg={err} />{msg && <p className="text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">{msg}</p>}
        <button className="crystal-btn w-full">Update password</button>
      </form>
    </Shell>
  );
}
