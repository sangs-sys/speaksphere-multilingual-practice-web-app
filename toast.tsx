import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface ToastCtx { toast: (text: string) => void; badges: (b?: { emoji: string; title: string }[]) => void }
const Ctx = createContext<ToastCtx>({ toast: () => {}, badges: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, text }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4000);
  }, []);
  const badges = useCallback((b?: { emoji: string; title: string }[]) => {
    (b || []).forEach((x) => toast(`${x.emoji} New badge unlocked: ${x.title}!`));
  }, [toast]);
  return (
    <Ctx.Provider value={{ toast, badges }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {items.map((i) => (
          <div key={i.id} className="crystal animate-pop px-4 py-3 text-sm font-medium">{i.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
