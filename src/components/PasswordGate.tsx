import { useState, type FormEvent, type ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Knowledge Journal</CardTitle>
          <CardDescription>Masukkan password untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              autoFocus
              placeholder="Password"
              disabled={loading}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Memeriksa...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default PasswordGate;
