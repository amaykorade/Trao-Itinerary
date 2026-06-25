'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import GoogleLoginButton, { AuthDivider } from '@/components/GoogleLoginButton';
import { isGoogleAuthEnabled } from '@/components/Providers';
import { AuthFooterLink, AuthShell } from '@/components/AuthShell';
import { Alert } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credential: string) {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credential);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Google sign-in failed');
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your trips"
      footer={
        <>
          No account? <AuthFooterLink href="/register">Create one</AuthFooterLink>
        </>
      }
    >
      {error && <Alert>{error}</Alert>}

      {isGoogleAuthEnabled() && (
        <div className={error ? 'mt-4' : ''}>
          <GoogleLoginButton
            text="signin_with"
            onSuccess={handleGoogleLogin}
            onError={setError}
            disabled={loading}
          />
          <AuthDivider />
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-4 ${error || isGoogleAuthEnabled() ? 'mt-4' : ''}`}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  );
}
