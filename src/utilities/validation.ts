/**
 * Validates a hex color string and returns a boolean indicating its validity.
 *
 * @param {string} color - The hex color string to be validated.
 * @param {boolean} [escalate=true] - Optional parameter indicating whether to throw an error if the color string is invalid. Defaults to true.
 * @returns {boolean} - A boolean indicating whether the color string is valid.
 * @throws {Error} - Throws an error if the color string is invalid and  escalate  is true.
 */
export const validateHexColorString = (color: string, escalate = true): boolean => {
  const result = /^#[0-9A-F]{6}$/i.test(color);

  if (!result && escalate) {
    throw new Error(`Invalid color string: ${color}`);
  }

  return result;
};
