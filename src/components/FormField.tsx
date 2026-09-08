import type { InputHTMLAttributes } from 'react';

type IconName = 'mail' | 'lock';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  /** Field-level message from the API's `errors` object. */
  error?: string;
  icon?: IconName;
}

/** Inline SVGs so the app has no icon dependency for the foundation. */
const icons: Record<IconName, JSX.Element> = {
  mail: (
    <>
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="m2 6 8 5 8-5" />
    </>
  ),
  lock: (
    <>
      <circle cx="7" cy="10" r="3" />
      <path d="M10 10h8m-2 0v3m-2-3v2" />
    </>
  ),
};

export function FormField({ label, name, error, icon, ...inputProps }: FormFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={name}>
        {label}
      </label>

      <div className={error ? 'form-field__control form-field__control--error' : 'form-field__control'}>
        {icon && (
          <svg
            className="form-field__icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {icons[icon]}
          </svg>
        )}
        <input
          id={name}
          name={name}
          className="form-field__input"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
      </div>

      {error && (
        <p className="form-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
