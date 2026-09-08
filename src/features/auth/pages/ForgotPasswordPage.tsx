import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../../components/Alert';
import { FormField } from '../../../components/FormField';
import { paths } from '../../../routes/paths';
import { ApiError } from '../../../types/api';
import { authService } from '../services/auth.service';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      const result = await authService.forgotPassword(email.trim());
      setMessage(result || 'If that email exists, a reset link has been sent.');
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <header className="auth-form__header">
        <h2 className="auth-form__title">Reset your password</h2>
        <p className="auth-form__hint">We will email you a reset link.</p>
      </header>

      {error && <Alert tone="error" message={error} />}
      {message && <Alert tone="success" message={message} />}

      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        icon="mail"
        placeholder="example@email.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <button type="submit" className="button button--dark" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </button>

      <Link className="auth-form__link" to={paths.login}>
        Back to sign in
      </Link>
    </form>
  );
}
