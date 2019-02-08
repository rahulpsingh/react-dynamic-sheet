import React, { Component } from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import * as Matrix from "./matrix";
import * as PointMap from "./point-map";
import * as PointSet from "./point-set";
import * as actions from "./../actions";

class ActiveCell extends Component {
  handleChange = cell => {
    const { setData, getBindingsForCell, row, column } = this.props;
    const bindings = getBindingsForCell(cell);
    setData(cell, bindings, { row, column });
  };

  render() {
    let { DataEditor } = this.props;
    const {
      getValue,
      getType,
      getSelectTypes,
      hasError,
      row,
      column,
      cell,
      width,
      height,
      top,
      left,
      hidden,
      mode,
      edit,
      _hasError
    } = this.props;
    DataEditor = (cell && cell.DataEditor) || DataEditor;
    const cellHasError = _hasError && PointSet.has(_hasError, { row, column });
    return hidden ? null : (
      <div
        className={classnames("ActiveCell", mode)}
        style={{ width, height, top, left }}
        onClick={mode === "view" ? edit : undefined}
      >
        {mode === "edit" && (
          <DataEditor
            row={row}
            column={column}
            cell={cell}
            onChange={this.handleChange}
            getValue={getValue}
            getType={getType}
            getSelectTypes={getSelectTypes}
            hasError={hasError}
            cellHasError={cellHasError}
          />
        )}
      </div>
    );
  }
}

const EmptyDimensions = {
  width: 0,
  height: 0,
  top: 0,
  left: 0
};

const mapStateToProps = state => {
  if (!state.active || !PointMap.has(state.active, state.cellDimensions)) {
    return { hidden: true };
  }
  const dimensions =
    PointMap.get(state.active, state.cellDimensions) || EmptyDimensions;
  return {
    hidden: false,
    ...state.active,
    cell: Matrix.get(state.active.row, state.active.column, state.data),
    width: dimensions.width,
    height: dimensions.height,
    top: dimensions.top,
    left: dimensions.left,
    mode: state.mode,
    _hasError: state.hasError
  };
};

const mapDispatchToProps = dispatch => ({
  setData: (data, bindings, cellPointer) =>
    dispatch(actions.setData(data, bindings, cellPointer)),
  edit: () => dispatch(actions.edit())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActiveCell);
