import React, { PureComponent } from "react";
import classnames from "classnames";
import { connect } from "react-redux";

import * as PointSet from "./point-set";
import * as PointMap from "./point-map";
import * as Matrix from "./matrix";
import * as actions from "./../actions";
import { isActive, getOffsetRect } from "./util";

export class Cell extends PureComponent {
  handleRoot = root => {
    this.root = root;
  };

  handleMouseDown = e => {
    const {
      row,
      column,
      setCellDimensions,
      select,
      activate,
      mode
    } = this.props;
    if (mode === "view") {
      setCellDimensions({ row, column }, getOffsetRect(e.currentTarget));

      if (e.shiftKey) {
        select({ row, column });
        return;
      }

      activate({ row, column });
    }
  };

  handleMouseOver = e => {
    const { row, column, dragging, setCellDimensions, select } = this.props;
    if (dragging) {
      setCellDimensions({ row, column }, getOffsetRect(e.currentTarget));
      select({ row, column });
    }
  };

  componentDidUpdate() {
    const {
      row,
      column,
      active,
      selected,
      mode,
      setCellDimensions
    } = this.props;
    if (selected && this.root) {
      setCellDimensions({ row, column }, getOffsetRect(this.root));
    }
    if (this.root && active && mode === "view") {
      this.root.focus();
    }
  }

  render() {
    const {
      row,
      column,
      getValue,
      getType,
      getSelectTypes,
      formulaParser,
      hasError
    } = this.props;
    let { DataViewer, data } = this.props;
    if (data && data.DataViewer) {
      ({ DataViewer, ...data } = data);
    }

    return (
      <td
        ref={this.handleRoot}
        className={classnames({
          readonly: data && data.readOnly,
          "has-error": hasError
        })}
        onMouseOver={this.handleMouseOver}
        onMouseDown={this.handleMouseDown}
        tabIndex={0}
      >
        <DataViewer
          row={row}
          column={column}
          cell={data}
          getValue={getValue}
          getType={getType}
          getSelectTypes={getSelectTypes}
          formulaParser={formulaParser}
        />
      </td>
    );
  }
}

function mapStateToProps(
  {
    data,
    active,
    selected,
    copied,
    hasPasted,
    mode,
    dragging,
    lastChanged,
    bindings,
    hasError
  },
  { column, row }
) {
  const point = { row, column };
  const cellIsActive = isActive(active, point);

  const cellBindings = PointMap.get(point, bindings);

  return {
    active: cellIsActive,
    selected: PointSet.has(selected, point),
    hasError: PointSet.has(hasError, point),
    copied: PointMap.has(point, copied),
    mode: cellIsActive ? mode : "view",
    data: Matrix.get(row, column, data),
    dragging,
    _bindingChanged:
      cellBindings && lastChanged && PointSet.has(cellBindings, lastChanged)
        ? {}
        : null
  };
}

const mapDispatchToProps = dispatch => ({
  select: cellPointer => dispatch(actions.select(cellPointer)),
  activate: cellPointer => dispatch(actions.activate(cellPointer)),
  setCellDimensions: (point, dimensions) =>
    dispatch(actions.setCellDimensions(point, dimensions))
});

export const enhance = connect(
  mapStateToProps,
  mapDispatchToProps
);
