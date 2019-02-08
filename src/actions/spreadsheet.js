import * as actionTypes from "./types";

export const select = cellPointer => ({
  type: actionTypes.SELECT_CELL,
  cellPointer
});

export const activate = cellPointer => ({
  type: actionTypes.ACTIVATE_CELL,
  cellPointer
});

export const setData = (data, bindings, cellPointer) => ({
  type: actionTypes.SET_DATA,
  data,
  bindings,
  cellPointer
});

export const setCellDimensions = (point, dimensions) => ({
  type: actionTypes.SET_CELL_DIAMENSIONS,
  point,
  dimensions
});

export const copy = () => ({
  type: actionTypes.COPY_DATA
});

export const cut = () => ({
  type: actionTypes.CUT_DATA
});

export const paste = () => ({
  type: actionTypes.PASTE_DATA
});

export const edit = () => ({
  type: actionTypes.EDIT_CELL
});

export const view = () => ({
  type: actionTypes.VIEW_CELL
});

export const hasError = cellPointer => ({
  type: actionTypes.HAS_ERROR,
  cellPointer
});

export const unFocus = () => ({
  type: actionTypes.UNFOCUS_CELL
});

export const go = (rowDelta, columnDelta) => ({
  type: actionTypes.GO_TO_CELL,
  rowDelta,
  columnDelta
});

export const modifyEdge = (field, delta) => ({
  type: actionTypes.MODIFY_EDGE,
  field,
  delta
});

export const keyPress = () => ({
  type: actionTypes.KEY_PRESS
});

export const dragStart = () => ({
  type: actionTypes.DRAG_START
});

export const dragEnd = () => ({
  type: actionTypes.DRAG_END
});
