/** 
 * Generates a random color and returns it as a number. 
 *  
 * @returns {number} - A random color represented as a number. 
 */ 
export const randomColor = (): number => {
  const randomColorInt = Math.floor(Math.random() * 16777216);
  const hexColor = randomColorInt.toString(16).padStart(6, '0');
  const hexColorString = '0x' + hexColor;

  return parseInt(hexColorString);
};
