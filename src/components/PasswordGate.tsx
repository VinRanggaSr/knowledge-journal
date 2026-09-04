import { useState, type FormEvent, type ReactNode } from 'react';
import { BookOpen } from 'lucide-react';

export const STORAGE_KEY = 'kj-unlocked';

interface PasswordGateProps {
  children: ReactNode;
}

function PasswordGate({ children }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      });
      const data = await response.json();

      if (data.ok) {
        localStorage.setItem(STORAGE_KEY, 'true');
        setUnlocked(true);
      } else {
        setError('Password salah, coba lagi.');
      }
    } catch {
      setError('Tidak bisa menghubungi server. Coba lagi sebentar.');
    } finally {
      setLoading(false);
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-background bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/images/login-bg.png')" }}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-background/80 p-8 text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-surface shadow-sm">
          <BookOpen className="h-5 w-5 text-foreground" />
        </div>
        <h1 className="text-xl font-bold">Knowledge Journal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Masuk untuk lanjut ke knowledge journal kamu</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            autoFocus
            placeholder="Masukan password"
            disabled={loading}
            className="h-11 rounded-xl border border-border bg-background px-3 text-center text-sm outline-none focus:border-foreground/40 disabled:opacity-50"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-foreground text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordGate;
