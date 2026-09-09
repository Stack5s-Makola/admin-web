import { Icon } from '@iconify/react';
import type { InputHTMLAttributes } from 'react';

type IconName = 'mail' | 'lock';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  /** Field-level message from the API's `errors` object. */
  error?: string;
  icon?: IconName;
}

const icons: Record<IconName, string> = {
  mail: 'carbon:email',
  lock: 'carbon:password',
};

export function FormField({ label, name, error, icon, ...inputProps }: FormFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={name}>
        {label}
      </label>

      <div className={error ? 'form-field__control form-field__control--error' : 'form-field__control'}>
        {icon && <Icon className="form-field__icon" icon={icons[icon]} aria-hidden="true" />}
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
