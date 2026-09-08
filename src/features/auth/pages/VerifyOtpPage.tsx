import { useRef, useState, type ChangeEvent, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { paths } from '../../../routes/paths';
import { ApiError } from '../../../types/api';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';

const OTP_LENGTH = 6;

interface LocationState {
  email?: string;
  userId?: string;
  next?: string | null;
}

export function VerifyOtpPage() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Reached directly, without going through login.
  if (!state.email) {
    return <Navigate to={paths.login} replace />;
  }

  const code = digits.join('');

  function focusInput(index: number) {
    inputsRef.current[index]?.focus();
  }

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/\D/g, '');
    if (!value) return;

    setDigits((current) => {
      const next = [...current];
      next[index] = value[value.length - 1];
      return next;
    });

    if (index < OTP_LENGTH - 1) focusInput(index + 1);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      setDigits((current) => {
        const next = [...current];
        if (next[index]) {
          next[index] = '';
        } else if (index > 0) {
          next[index - 1] = '';
          focusInput(index - 1);
        }
        return next;
      });
    }
    if (event.key === 'ArrowLeft' && index > 0) focusInput(index - 1);
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) focusInput(index + 1);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((digit, index) => {
      next[index] = digit;
    });
    setDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (code.length !== OTP_LENGTH) {
      setError(`Enter all ${OTP_LENGTH} digits.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp({ email: state.email!, userId: state.userId, otp: code });
      navigate(state.next ?? paths.dashboard, { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Verification failed. Try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      focusInput(0);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError('');
    setMessage('');
    try {
      const result = await authService.resendOtp(state.email!);
      setMessage(result || 'A new code is on its way.');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not resend the code.');
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <header className="auth-form__header">
        <h2 className="auth-form__title">Verify Your Email</h2>
        <p className="auth-form__hint">
          We&apos;ve sent a {OTP_LENGTH}-digit verification code to your email address. Enter the
          code below to continue.
        </p>
      </header>

      {error && <Alert tone="error" message={error} />}
      {message && <Alert tone="success" message={message} />}

      <div className="otp-inputs" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            className="otp-input"
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            aria-label={`Digit ${index + 1}`}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
          />
        ))}
      </div>

      <button type="submit" className="button button--dark" disabled={isSubmitting}>
        {isSubmitting ? 'Verifying…' : 'Verify OTP'}
      </button>

      <p className="auth-form__footnote">
        Didn&apos;t receive the code?{' '}
        <button type="button" className="link-button" onClick={handleResend}>
          Resend Code
        </button>
      </p>
    </form>
  );
}
