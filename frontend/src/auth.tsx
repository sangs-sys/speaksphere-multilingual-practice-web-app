import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from './api';
import { Lang, User } from './types';

interface AuthCtx {
  user: User | null; languages: Lang[]; loading: boolean;
  lang: (code: string | null | undefined) => Lang | undefined;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void; refresh: () => Promise<void>; setUser: (u: User) => void;
}
const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [languages, setLanguages] = useState<Lang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLanguages((await api<{ languages: Lang[] }>('/languages')).languages); } catch { /* shown on pages */ }
      if (getToken()) {
        try { setUser((await api<{ user: User }>('/auth/me')).user); } catch { clearToken(); }
      }
      setLoading(false);
    })();
  }, []);

  const finish = (r: { token: string; user: User }) => { setToken(r.token); setUser(r.user); };
  const value: AuthCtx = {
    user, languages, loading, setUser,
    lang: (code) => languages.find((l) => l.code === code),
    login: async (identifier, password) => finish(await api('/auth/login', { body: { identifier, password } })),
    signup: async (username, email, password) => finish(await api('/auth/signup', { body: { username, email, password } })),
    logout: () => { clearToken(); setUser(null); },
    refresh: async () => setUser((await api<{ user: User }>('/auth/me')).user),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
