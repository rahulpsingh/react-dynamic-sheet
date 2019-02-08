import * as PointSet from "./../components/point-set";
import * as PointMap from "./../components/point-map";
import * as Matrix from "./../components/matrix";
import * as actionTypes from "./../actions/types";
import { isActive, setCell, updateData } from "./../components/util";
import { range } from "./../components/util";

export const INITIAL_ROWS = 10;
export const INITIAL_COLUMNS = 0;

const initialData = range(INITIAL_ROWS).map(() => Array(INITIAL_COLUMNS));

const initialState = {
  selected: PointSet.from([]),
  copied: PointMap.from([]),
  active: null,
  mode: "view",
  cellDimensions: PointMap.from([]),
  lastChanged: null,
  bindings: PointMap.from([]),
  data: initialData,
  columnLabels: [],
  hasError: PointMap.from([])
};

function spreadsheetReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SELECT_CELL: {
      if (state.active && !isActive(state.active, action.cellPointer)) {
        return {
          ...state,
          selected: PointSet.from(
            Matrix.inclusiveRange(
              {
                row: action.cellPointer.row,
                column: action.cellPointer.column
              },
              { row: state.active.row, column: state.active.column }
            )
          )
        };
      }
      return state;
    }
    case actionTypes.ACTIVATE_CELL:
      return {
        ...state,
        selected: PointSet.from([action.cellPointer]),
        active: action.cellPointer,
        mode: isActive(state.active, action.cellPointer) ? "edit" : "view"
      };
    case actionTypes.SET_DATA:
      return {
        ...state,
        mode: "edit",
        data: setCell(state, action.data),
        lastChanged: state.active,
        bindings: PointMap.set(
          state.active,
          PointSet.from(action.bindings),
          state.bindings
        ),
        hasError: PointSet.remove(state.hasError, action.cellPointer)
      };
    case actionTypes.SET_CELL_DIAMENSIONS: {
      const prevDimensions = PointMap.get(action.point, state.cellDimensions);
      if (
        prevDimensions &&
        prevDimensions.width === action.dimensions.width &&
        prevDimensions.height === action.dimensions.height &&
        prevDimensions.top === action.dimensions.top &&
        prevDimensions.left === action.dimensions.left
      ) {
        return state;
      }

      return {
        ...state,
        cellDimensions: PointMap.set(
          action.point,
          action.dimensions,
          state.cellDimensions
        )
      };
    }
    case actionTypes.COPY_DATA:
      return {
        ...state,
        copied: PointSet.reduce(
          (acc, point) =>
            PointMap.set(
              point,
              Matrix.get(point.row, point.column, state.data),
              acc
            ),
          state.selected,
          PointMap.from([])
        ),
        cut: false,
        hasPasted: false
      };
    case actionTypes.CUT_DATA:
      return {
        ...state,
        copied: PointSet.reduce(
          (acc, point) =>
            PointMap.set(
              point,
              Matrix.get(point.row, point.column, state.data),
              acc
            ),
          state.selected,
          PointMap.from([])
        ),
        cut: false,
        hasPasted: false
      };
    case actionTypes.PASTE_DATA: {
      const minPoint = PointSet.min(state.copied);

      const { data, selected } = PointMap.reduce(
        (acc, value, { row, column }) => {
          if (!state.active) {
            return acc;
          }

          const nextRow = row - minPoint.row + state.active.row;
          const nextColumn = column - minPoint.column + state.active.column;
          const nextValue = {
            ...value,
            ...Matrix.get(nextRow, nextColumn, acc.data)
          };

          const nextData = state.cut
            ? Matrix.unset(row, column, acc.data)
            : acc.data;

          if (!Matrix.has(nextRow, nextColumn, state.data)) {
            return { data: nextData, selected: acc.selected };
          }

          return {
            data: Matrix.set(nextRow, nextColumn, nextValue, nextData),
            selected: PointSet.add(acc.selected, {
              row: nextRow,
              column: nextColumn
            })
          };
        },
        state.copied,
        { data: state.data, selected: PointSet.from([]) }
      );
      return {
        ...state,
        data,
        selected,
        cut: false,
        hasPasted: true,
        mode: "view"
      };
    }
    case actionTypes.EDIT_CELL:
      return { ...state, mode: "edit" };
    case actionTypes.HAS_ERROR:
      return {
        ...state,
        hasError: PointSet.isEmpty(state.hasError)
          ? PointSet.from([action.cellPointer])
          : PointSet.add(state.hasError, action.cellPointer)
      };
    case actionTypes.VIEW_CELL:
      return { ...state, mode: "view" };
    case actionTypes.UNFOCUS_CELL: {
      if (!state.active) {
        return state;
      }
      return {
        ...state,
        data: PointSet.reduce(
          (acc, point) =>
            updateData(acc, {
              ...point,
              data: undefined
            }),
          state.selected,
          state.data
        )
      };
    }
    case actionTypes.GO_TO_CELL: {
      if (!state.active) {
        return state;
      }
      const nextActive = {
        row: state.active.row + action.rowDelta,
        column: state.active.column + action.columnDelta
      };
      if (!Matrix.has(nextActive.row, nextActive.column, state.data)) {
        return { ...state, mode: "view" };
      }
      return {
        ...state,
        active: nextActive,
        selected: PointSet.from([nextActive]),
        mode: "view"
      };
    }
    case actionTypes.MODIFY_EDGE: {
      if (!state.active) {
        return state;
      }

      const edgeOffsets = PointSet.has(state.selected, {
        ...state.active,
        [action.field]: state.active[action.field] + action.delta * -1
      });

      const nextSelected = edgeOffsets
        ? PointSet.shrinkEdge(state.selected, action.field, action.delta * -1)
        : PointSet.extendEdge(state.selected, action.field, action.delta);

      return {
        ...state,
        selected: PointSet.filter(
          point => Matrix.has(point.row, point.column, state.data),
          nextSelected
        )
      };
    }
    case actionTypes.KEY_PRESS: {
      if (state.mode === "view" && state.active) {
        return { ...state, mode: "edit" };
      }
      return state;
    }
    case actionTypes.DRAG_START:
      return { ...state, dragging: true };
    case actionTypes.DRAG_END:
      return { ...state, dragging: true };
    case actionTypes.ADD_ROW: {
      return {
        ...state,
        data: [
          ...state.data,
          ...Array(10)
            .fill()
            .map(x =>
              state.data[0].map(item => ({
                type: item.type,
                required: item.required,
                createdSelectTypes: item.createdSelectTypes
              }))
            )
        ]
      };
    }
    case actionTypes.ADD_COLUMN:
      return {
        ...state,
        data: state.data.map(row => {
          const nextRow = [...row];
          nextRow.push({
            type: action.colType,
            required: action.required,
            createdSelectTypes: action.createdSelectTypes
          });
          return nextRow;
        }),
        columnLabels: [...state.columnLabels, action.colName]
      };
    default:
      return state;
  }
}

export default spreadsheetReducer;
