// TEMPORARY LOGIN SCREEN
// TBA: DIVIDING ELEMENTS INTO COMPONENTS

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/src/config/env';

export default function Login () {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ważne — pozwala przeglądarce wysyłać/odbierać cookie
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }

      router.push('/dashboard');
      router.refresh(); // odświeża Server Components, żeby "zobaczyły" nowe cookie
    } catch (err) {
      setError('Network error — try again');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="identifier">Email or username</label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}