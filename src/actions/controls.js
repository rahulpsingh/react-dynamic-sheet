import * as actionTypes from "./types";

export const addRow = () => ({
  type: actionTypes.ADD_ROW
});

export const addColumn = (colName, colType, required, createdSelectTypes) => ({
  type: actionTypes.ADD_COLUMN,
  colName,
  colType,
  createdSelectTypes,
  required
});
