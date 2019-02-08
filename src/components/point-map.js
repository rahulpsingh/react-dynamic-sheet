/** Sets the value for point in map */
export function set(point, value, map) {
  return {
    ...map,
    [point.row]: {
      ...map[point.row],
      [point.column]: value
    }
  };
}

export function unset({ row, column }, map) {
  if (!(row in map) || !(column in map[row])) {
    return map;
  }
  const {
    [String(row)]: { [String(column)]: _, ...nextRow },
    ...nextMap
  } = map;
  if (Object.keys(nextRow).length === 0) {
    return nextMap;
  }
  return { ...nextMap, [row]: nextRow };
}

/** Gets the value for point in map */
export function get(point, map) {
  return map[point.row] && map[point.row][point.column];
}

/** Checks if map has point assigned to value */
export function has(point, map) {
  return point.row in map && point.column in map[point.row];
}

const EMPTY = {};

/** Creates a new PointMap instance from an array-like or iterable object. */
export function from(pairs) {
  return pairs.reduce((acc, [point, value]) => set(point, value, acc), EMPTY);
}

/** Returns the number of elements in a PointMap object. */
export function size(map) {
  let acc = 0;
  const _map_keys = Object.keys(map);
  for (let i = 0; i < _map_keys.length; i++) {
    const row = Number(_map_keys[i]);
    const columns = map[row];
    acc += Object.keys(columns).length;
  }
  return acc;
}

/** Applies a function against an accumulator and each value and point in the map (from left to right) to reduce it to a single value */
export function reduce(func, map, initialValue) {
  let acc = initialValue;
  const _map_keys = Object.keys(map);
  for (let i = 0; i < _map_keys.length; i++) {
    const row = Number(_map_keys[i]);
    const columns = map[row];
    const _columns_keys = Object.keys(columns);
    for (let j = 0; j < _columns_keys.length; j++) {
      const column = Number(_columns_keys[j]);
      const value = columns[column];
      acc = func(acc, value, { row: row, column: column });
    }
  }
  return acc;
}

/** Creates a new map with the results of calling a provided function on every value in the calling map */
export function map(func, map) {
  return reduce(
    (acc, value, point) => set(point, func(value), acc),
    map,
    from([])
  );
}

/** Returns whether map has any points set to value */
export function isEmpty(map) {
  return Object.keys(map).length === 0;
}
