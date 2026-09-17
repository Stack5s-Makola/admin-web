import { useState } from 'react';

/**
 * Small square image for table rows, with an initials fallback.
 *
 * Separate from <Avatar>, which is positioned absolutely for the sidebar
 * account card and can't be dropped into a table cell.
 */

interface ThumbProps {
  src?: string | null;
  name: string;
  /** Circular for people, rounded square for shops and listings. */
  shape?: 'circle' | 'square';
}

export function Thumb({ src, name, shape = 'circle' }: ThumbProps) {
  const [failed, setFailed] = useState(false);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  const className = `thumb thumb--${shape}`;

  if (!src || failed) {
    return (
      <span className={`${className} thumb--fallback`} aria-hidden="true">
        {initials}
      </span>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
