interface AlertProps {
  tone: 'error' | 'success';
  message: string;
}

export function Alert({ tone, message }: AlertProps) {
  return (
    <p className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {message}
    </p>
  );
}
