import { Dimension2, Position } from '../types/math.type';

/**
 * Calculates the absolute position of an element based on its relative position and the dimensions of its parent container.
 *
 * @param {Position} position - An object containing the x and y coordinates of the element's relative position, and a boolean flag indicating if the position is relative.
 * @param {Dimension2} dimension - An object containing the width and height of the parent container.
 * @returns {Position} - An object representing the absolute position of the element, with x and y coordinates.
 */
export const calculatePosition = (position: Position, dimension: Dimension2): Position => {
  const { x, y, relative } = position;
  const { width, height } = dimension;

  if (relative) {
    return {
      x: width * x,
      y: height * y,
    };
  }

  return {
    x,
    y,
  };
};
