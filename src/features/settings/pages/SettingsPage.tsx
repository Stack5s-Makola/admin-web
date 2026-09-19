import { Icon } from '@iconify/react';
import { useTheme, type Theme } from '../context/ThemeContext';

const themeOptions: Array<{ value: Theme; label: string; description: string; icon: string }> = [
  {
    value: 'light',
    label: 'Light mode',
    description: 'Use the bright Makola workspace with green navigation.',
    icon: 'solar:sun-2-bold',
  },
  {
    value: 'dark',
    label: 'Dark mode',
    description: 'Use the dark admin layout for lower-light environments.',
    icon: 'solar:moon-bold',
  },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="settings-page">
      <header className="page__head">
        <div>
          <p className="settings-page__eyebrow">Workspace preferences</p>
          <h1 className="page__title">Settings</h1>
        </div>
      </header>

      <div className="settings-page__content">
        <section className="settings-panel" aria-labelledby="appearance-title">
          <div className="settings-panel__heading">
            <div className="settings-panel__icon" aria-hidden="true">
              <Icon icon="solar:palette-bold" width={22} />
            </div>
            <div>
              <h2 id="appearance-title">Appearance</h2>
              <p>Choose how the Makola admin workspace looks for you.</p>
            </div>
          </div>

          <div className="theme-options" role="radiogroup" aria-label="Theme preference">
            {themeOptions.map((option) => {
              const selected = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`theme-option${selected ? ' theme-option--selected' : ''}`}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTheme(option.value)}
                >
                  <span className="theme-option__icon" aria-hidden="true">
                    <Icon icon={option.icon} width={22} />
                  </span>
                  <span className="theme-option__copy">
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </span>
                  <span className="theme-option__radio" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
