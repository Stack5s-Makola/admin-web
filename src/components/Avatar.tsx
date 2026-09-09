import { useState } from 'react';

interface AvatarProps {
  /** Cloudinary URL from the user's profile_image column; may be null. */
  src?: string | null;
  name: string;
}

/** Circular profile photo with an initials fallback for missing or dead URLs. */
export function Avatar({ src, name }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'A';

  if (!src || failed) {
    return (
      <span className="avatar avatar--fallback" title={name} aria-hidden="true">
        {initials}
      </span>
    );
  }

  return (
    <img
      className="avatar"
      src={src}
      alt=""
      title={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
