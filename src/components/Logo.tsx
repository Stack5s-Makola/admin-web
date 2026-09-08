import wordmark from '../assets/logo-wordmark.png';

/**
 * Makola wordmark.
 * Extracted from Charity's Figma export - replace with the SVG when she shares it
 * (drop it in src/assets and change this import).
 */
export function Logo() {
  return <img className="logo" src={wordmark} alt="Makola" />;
}
