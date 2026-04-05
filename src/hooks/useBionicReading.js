/**
 * Bionic Reading Hook
 * Wraps the first 40-50% of every word in <b> tags to guide the eye
 * and reduce cognitive load for neurodivergent readers.
 */

/**
 * @param {string} word
 * @returns {string} HTML with the first ~45% bolded
 */
function bionicWord(word) {
  if (word.length <= 1) return `<b>${word}</b>`;
  const boldLen = Math.ceil(word.length * 0.45);
  return `<b>${word.slice(0, boldLen)}</b>${word.slice(boldLen)}`;
}

/**
 * @param {string} text - Plain text input
 * @returns {string} HTML string with bionic formatting applied
 */
export function applyBionicReading(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map(line =>
      line
        .split(/(\s+)/)
        .map(token => {
          if (/^\s+$/.test(token)) return token;
          // Strip HTML tags if any, apply bionic only to text
          const clean = token.replace(/<[^>]*>/g, '');
          return bionicWord(clean);
        })
        .join('')
    )
    .join('\n');
}

/**
 * React hook wrapping the bionic reading logic
 */
import { useState, useCallback } from 'react';

export function useBionicReading() {
  const [enabled, setEnabled] = useState(false);

  const transform = useCallback((text) => {
    if (!enabled) return text;
    return applyBionicReading(text);
  }, [enabled]);

  return { enabled, setEnabled, transform, applyBionicReading };
}
