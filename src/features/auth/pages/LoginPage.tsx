import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { FormField } from '../../../components/FormField';
import { paths } from '../../../routes/paths';
import { ApiError, type FieldErrors } from '../../../types/api';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setFieldErrors({});

    if (!email.trim() || !password) {
      setFieldErrors({
        ...(email.trim() ? {} : { email: 'Email is required' }),
        ...(password ? {} : { password: 'Password is required' }),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const outcome = await login({ email: email.trim(), password });

      if (outcome.status === 'otp_required') {
        navigate(paths.verifyOtp, {
          state: { email: outcome.email, userId: outcome.userId, next: searchParams.get('next') },
        });
        return;
      }

      navigate(searchParams.get('next') ?? paths.dashboard, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        if (error.errors) setFieldErrors(error.errors);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <header className="auth-form__header">
        <h2 className="auth-form__title">Admin Portal</h2>
        <p className="auth-form__hint">Sign in to manage the platform</p>
      </header>

      {formError && <Alert tone="error" message={formError} />}

      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="example@email.com"
        autoComplete="email"
        icon="mail"
        value={email}
        error={fieldErrors.email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••••••"
        autoComplete="current-password"
        icon="lock"
        value={password}
        error={fieldErrors.password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <Link className="auth-form__link auth-form__link--inline" to={paths.forgotPassword}>
        or forgot password?
      </Link>

      <button type="submit" className="button button--dark" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Login'}
      </button>
    </form>
  );
}
