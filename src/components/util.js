import clipboard from "clipboard-polyfill";

/**
 * Creates an array of numbers (positive and/or negative) progressing from start up to, but not including, end. A step of -1 is used if a negative start is specified without an end or step. If end is not specified, it's set to start with start then set to 0.
 * @param end
 * @param start
 * @param step
 */
export function range(end, start = 0, step = 1) {
  let array = [];
  if (Math.sign(end - start) === -1) {
    for (let element = start; element > end; element -= step) {
      array.push(element);
    }
    return array;
  }
  for (let element = start; element < end; element += step) {
    array.push(element);
  }
  return array;
}

export function updateData(data, cellDescriptor) {
  const row = data[cellDescriptor.row];
  const nextData = [...data];
  const nextRow = row ? [...row] : [];
  nextRow[cellDescriptor.column] = cellDescriptor.data;
  nextData[cellDescriptor.row] = nextRow;
  return nextData;
}

export function setCell(state, cell) {
  return updateData(state.data, {
    ...state.active,
    data: cell
  });
}

export function isActive(active, { row, column }) {
  return Boolean(active && column === active.column && row === active.row);
}

export const getOffsetRect = element => ({
  width: element.offsetWidth,
  height: element.offsetHeight,
  left: element.offsetLeft,
  top: element.offsetTop
});

/**
 * @todo better error management
 */
/**
 * Wraps Clipboard.writeText() with permission check if necessary
 * @param string - The string to be written to the clipboard.
 */
export const writeTextToClipboard = string => {
  const write = () => clipboard.writeText(string);
  if (navigator.permissions) {
    navigator.permissions
      .query({
        name: "clipboard-read"
      })
      .then(readClipboardStatus => {
        if (readClipboardStatus.state) {
          write();
        }
      });
  } else {
    write();
  }
};
