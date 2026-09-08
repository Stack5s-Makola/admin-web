import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { FormField } from '../../../components/FormField';
import { paths } from '../../../routes/paths';
import { ApiError, type FieldErrors } from '../../../types/api';
import { authService } from '../services/auth.service';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.resetPassword({ token, password });
      setMessage(result || 'Password updated. You can sign in now.');
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        if (caught.errors) setFieldErrors(caught.errors);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-form">
        <h2 className="auth-form__title">Invalid reset link</h2>
        <Alert tone="error" message="This link is missing its token. Request a new one." />
        <Link className="auth-form__link" to={paths.forgotPassword}>
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <header className="auth-form__header">
        <h2 className="auth-form__title">Choose a new password</h2>
      </header>

      {error && <Alert tone="error" message={error} />}
      {message && <Alert tone="success" message={message} />}

      <FormField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        icon="lock"
        value={password}
        error={fieldErrors.password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <FormField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        icon="lock"
        value={confirmPassword}
        error={fieldErrors.confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />

      <button type="submit" className="button button--dark" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Update password'}
      </button>

      <Link className="auth-form__link" to={paths.login}>
        Back to sign in
      </Link>
    </form>
  );
}
