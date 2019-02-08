import { range as _range } from "./util";

/** Gets the value at row and column of matrix. */
export function get(row, column, matrix) {
  const columns = matrix[row];
  if (columns === undefined) {
    return undefined;
  }
  return columns[column];
}

/** Creates a slice of matrix from startPoint up to, but not including, endPoint. */
export function slice(startPoint, endPoint, matrix) {
  let sliced = [];
  const columns = endPoint.column - startPoint.column;
  for (let row = startPoint.row; row <= endPoint.row; row++) {
    const slicedRow = row - startPoint.row;
    sliced[slicedRow] = sliced[slicedRow] || Array(columns);
    for (let column = startPoint.column; column <= endPoint.column; column++) {
      sliced[slicedRow][column - startPoint.column] = get(row, column, matrix);
    }
  }
  return sliced;
}

/** Sets the value at row and column of matrix. If a row doesn't exist, it's created. */
export function set(row, column, value, matrix) {
  const nextMatrix = [...matrix];

  // Synchronize first row length
  const firstRow = matrix[0];
  const nextFirstRow = firstRow ? [...firstRow] : [];
  if (nextFirstRow.length - 1 < column) {
    nextFirstRow[column] = undefined;
    nextMatrix[0] = nextFirstRow;
  }

  const nextRow = matrix[row] ? [...matrix[row]] : [];
  nextRow[column] = value;
  nextMatrix[row] = nextRow;

  return nextMatrix;
}

/** Like Matrix.set() but mutates the matrix */
export function mutableSet(row, column, value, matrix) {
  let firstRow = matrix[0];
  if (!firstRow) {
    firstRow = [];
    matrix[0] = firstRow;
  }
  if (!(row in matrix)) {
    matrix[row] = [];
  }
  // Synchronize first row length
  if (!(column in firstRow)) {
    firstRow[column] = undefined;
  }
  matrix[row][column] = value;
}

/** Removes the coordinate of matrix */
export function unset(row, column, matrix) {
  if (!has(row, column, matrix)) {
    return matrix;
  }
  const nextMatrix = [...matrix];
  const nextRow = [...matrix[row]];

  // Avoid deleting to preserve first row length
  nextRow[column] = undefined;
  nextMatrix[row] = nextRow;

  return nextMatrix;
}

export function reduce(func, matrix, initialValue) {
  const { rows, columns } = getSize(matrix);
  let acc = initialValue;
  for (let row = 0; row < rows; row++) {
    if (!matrix[row]) {
      continue;
    }
    for (let column = 0; column < columns; column++) {
      if (column in matrix[row]) {
        acc = func(acc, matrix[row][column], { row, column });
      }
    }
  }
  return acc;
}

/** Creates an array of values by running each element in collection thru iteratee. */
export function map(func, matrix) {
  return reduce(
    (acc, value, point) => {
      mutableSet(point.row, point.column, func(value, point), acc);
      return acc;
    },
    matrix,
    []
  );
}

/**
 * Converts all elements in row into a string separated by horizontalSeparator and each row string
 * to string separated by verticalSeparator
 */
export function join(
  matrix,
  horizontalSeparator = ", ",
  verticalSeparator = "\n"
) {
  let joined = "";
  const { rows, columns } = getSize(matrix);
  for (let row = 0; row < rows; row++) {
    if (row) {
      joined += verticalSeparator;
    }
    for (let column = 0; column < columns; column++) {
      if (column) {
        joined += horizontalSeparator;
      }
      if (matrix[row] && column in matrix[row]) {
        joined += String(matrix[row][column]);
      }
    }
  }
  return joined;
}

/** Returns whether the point exists in the matrix or not. */
export function has(row, column, matrix) {
  const firstRow = matrix[0];
  return (
    firstRow &&
    // validation
    row >= 0 &&
    column >= 0 &&
    Number.isInteger(row) &&
    Number.isInteger(column) &&
    // first row length is in sync with other rows
    column < firstRow.length &&
    row < matrix.length
  );
}

/** Gets the size of matrix by returning its number of rows and columns */
export function getSize(matrix) {
  const firstRow = matrix[0];
  return {
    columns: firstRow ? firstRow.length : 0,
    rows: matrix.length
  };
}

/** Creates an array of points (positive and/or negative) progressing from startPoint up to, but not including, endPoint. */
export function range(endPoint, startPoint) {
  const points = [];
  const columnsRange =
    startPoint.column !== endPoint.column
      ? _range(endPoint.column, startPoint.column)
      : startPoint.row !== endPoint.row
      ? [startPoint.column]
      : [];

  const rowsRange =
    startPoint.row !== endPoint.row
      ? _range(endPoint.row, startPoint.row)
      : startPoint.column !== endPoint.column
      ? [startPoint.row]
      : [];

  for (let i = 0; i < rowsRange.length; i++) {
    const row = rowsRange[i];
    for (let j = 0; j < columnsRange.length; j++) {
      const column = columnsRange[j];
      points.push({ row, column });
    }
  }

  return points;
}

/** Like Matrix.range() but including endPoint. */
export const inclusiveRange = (endPoint, startPoint) =>
  range(
    {
      row: endPoint.row + Math.sign(endPoint.row - startPoint.row),
      column: endPoint.column + Math.sign(endPoint.column - startPoint.column)
    },
    startPoint
  );

export function toArray(matrix, transform) {
  let array = [];
  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix.length; column++) {
      const value = matrix[row][column];
      array.push(transform ? transform(value) : value);
    }
  }
  return array;
}
