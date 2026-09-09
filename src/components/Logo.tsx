import wordmark from '../assets/logo makola.svg';

/**
 * Makola wordmark.
 * Extracted from Charity's Figma export - replace with the SVG when she shares it
 * (drop it in src/assets and change this import).
 */
export function Logo() {
  return <img className="logo" src={wordmark} alt="Makola" />;
}
