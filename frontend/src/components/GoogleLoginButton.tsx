'use client';

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { isGoogleAuthEnabled } from './Providers';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => Promise<void>;
  onError?: (message: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
}: GoogleLoginButtonProps) {
  if (!isGoogleAuthEnabled()) {
    return null;
  }

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      onError?.('Google sign-in failed. No credential received.');
      return;
    }
    try {
      await onSuccess(response.credential);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }

  return (
    <div className={`flex justify-center ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.('Google sign-in was cancelled or failed')}
        theme="outline"
        size="large"
        text={text}
        shape="rectangular"
        width={384}
      />
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
        <span className="bg-white px-3 text-slate-400">or continue with email</span>
      </div>
    </div>
  );
}
