interface PlaceholderPageProps {
  title: string;
  note: string;
}

/**
 * Stand-in for screens built in the Tuesday -> Thursday task.
 * Keeps routing and the layout verifiable before the Admin APIs exist.
 */
export function PlaceholderPage({ title, note }: PlaceholderPageProps) {
  return (
    <section className="placeholder">
      <h1 className="placeholder__title">{title}</h1>
      <p className="placeholder__note">{note}</p>
    </section>
  );
}
