import React, { useState } from 'react';
import { useSession } from './session-context';
import { loginWithCredentials, LoginRole } from './auth-service';
import { FolderHeart, Eye, EyeOff, Shield, Lock, Mail, AlertCircle, Loader2, Info } from 'lucide-react';
import { ThemeToggle } from '../theme/theme-toggle';

const ROLE_CONFIG = {
  candidate: {
    label: 'Candidate / Patient',
    description: 'Access your personal health records, prescriptions, and lab reports.',
    color: 'var(--color-primary)',
    bg: 'var(--color-accent)',
  },
  receptionist: {
    label: 'Hospital Receptionist',
    description: 'Access reception workflows and authorized patient records.',
    color: 'var(--color-info)',
    bg: 'var(--color-info-bg)',
  },
} as const;

export const LoginView: React.FC = () => {
  const { loginWithJwt } = useSession();

  const [selectedRole, setSelectedRole] = useState<LoginRole>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Client-side field validation
  const [touched, setTouched] = useState({ email: false, password: false });
  const emailError = touched.email && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ? 'Please enter a valid email address.' : null;
  const passwordError = touched.password && password.length > 0 && password.length < 6
    ? 'Password must be at least 6 characters.' : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;

    setIsLoading(true);
    setErrorMsg(null);
    setIsDemoMode(false);

    try {
      const result = await loginWithCredentials({ email, password, role: selectedRole });

      if (result.success && result.user) {
        if (result.isDemo) setIsDemoMode(true);
        loginWithJwt(result.user, result.token);
      } else {
        setErrorMsg(result.error || 'Login failed. Please try again.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-accent) 100%)',
        padding: '1.5rem',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: '0 24px 64px -8px rgba(16, 24, 40, 0.14), 0 8px 20px -4px rgba(16, 24, 40, 0.08)',
          maxWidth: '440px',
          width: '100%',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <FolderHeart size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
              CarePilot AI
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
              Altrix Labs Health Copilot
            </span>
          </div>
        </div>

        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          Sign in to continue
        </p>

        {/* Demo mode banner */}
        {isDemoMode && (
          <div
            role="status"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              backgroundColor: 'var(--color-attention-bg)',
              border: '1px solid rgba(148, 98, 0, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8125rem',
              color: 'var(--color-attention)',
            }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              <strong>Demo mode active.</strong> The authentication backend is not yet available. This session uses locally
              simulated credentials and is not secure for production use.
            </span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              backgroundColor: 'var(--color-critical-bg)',
              border: '1px solid rgba(180, 35, 24, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.8125rem',
              color: 'var(--color-critical)',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Role selector */}
        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1.25rem 0' }}>
          <legend style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.625rem' }}>
            Sign in as
          </legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            {(Object.entries(ROLE_CONFIG) as [LoginRole, typeof ROLE_CONFIG[LoginRole]][]).map(([role, cfg]) => {
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  id={`role-${role}`}
                  aria-pressed={isSelected}
                  onClick={() => { setSelectedRole(role); setErrorMsg(null); }}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isSelected ? cfg.color : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? cfg.bg : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: isSelected ? cfg.color : 'var(--color-text-main)' }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    {cfg.description}
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}
            >
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}
              />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '0.6875rem 0.875rem 0.6875rem 2.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${emailError ? 'var(--color-critical)' : 'var(--color-border)'}`,
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text-main)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-primary)'; }}
                onBlurCapture={(e) => { if (!emailError) (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
              />
            </div>
            {emailError && (
              <span id="email-error" role="alert" style={{ fontSize: '0.75rem', color: 'var(--color-critical)', marginTop: '0.25rem', display: 'block' }}>
                {emailError}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '0.6875rem 2.75rem 0.6875rem 2.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${passwordError ? 'var(--color-critical)' : 'var(--color-border)'}`,
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text-main)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-primary)'; }}
                onBlurCapture={(e) => { if (!passwordError) (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '0.125rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && (
              <span id="password-error" role="alert" style={{ fontSize: '0.75rem', color: 'var(--color-critical)', marginTop: '0.25rem', display: 'block' }}>
                {passwordError}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.8125rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isLoading ? 'var(--color-text-muted)' : 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background-color var(--transition-fast)',
              marginTop: '0.25rem',
              fontFamily: 'inherit',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Signing in…
              </>
            ) : (
              <>
                <Shield size={16} />
                Sign In as {ROLE_CONFIG[selectedRole].label}
              </>
            )}
          </button>
        </form>

        {/* Security note */}
        <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1.5rem', textAlign: 'center', lineHeight: 1.5 }}>
          Role selection here does not grant authorization. All access is enforced by the backend.
        </p>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default LoginView;
