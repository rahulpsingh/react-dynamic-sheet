import React, { PureComponent } from "react";
import { connect } from "react-redux";

import {
  Parser as FormulaParser,
  columnIndexToLabel
} from "hot-formula-parser";
import Table from "./Table";

import Row from "./Row";

import { Cell, enhance as enhanceCell } from "./Cell";

import DataViewer from "./DataViewer";
import DataEditor from "./DataEditor";
import ActiveCell from "./ActiveCell";
import Selected from "./Selected";
import Copied from "./Copied";
import { getBindingsForCell } from "./bindings";
import { range, writeTextToClipboard } from "./util";
import * as PointSet from "./point-set";
import * as Matrix from "./matrix";
import * as actions from "./../actions";
import "./Spreadsheet.css";

const getValue = ({ data }) => (data && data.value ? data.value : null);
const getType = ({ data }) => (data && data.type ? data.type : null);
const getSelectTypes = ({ data }) =>
  data && data.createdSelectTypes ? data.createdSelectTypes : null;

const ColumnIndicator = ({ column, label }) =>
  label !== undefined ? (
    <th>{label}</th>
  ) : (
    <th>{columnIndexToLabel(column)}</th>
  );

const RowIndicator = ({ row }) => <th>{row + 1}</th>;

class Spreadsheet extends PureComponent {
  keyDownHandlers = {
    ArrowUp: this.props.go(-1, 0),
    ArrowDown: this.props.go(+1, 0),
    ArrowLeft: this.props.go(0, -1),
    ArrowRight: this.props.go(0, +1),
    Tab: this.props.go(0, +1),
    Enter: this.props.edit(),
    Backspace: this.props.unFocus()
  };

  editKeyDownHandlers = {
    Escape: this.props.view(),
    Tab: this.keyDownHandlers.Tab,
    Enter: this.keyDownHandlers.ArrowDown
  };

  shiftKeyDownHandlers = {
    ArrowUp: this.props.modifyEdge("row", -1),
    ArrowDown: this.props.modifyEdge("row", 1),
    ArrowLeft: this.props.modifyEdge("column", -1),
    ArrowRight: this.props.modifyEdge("column", 1)
  };

  static defaultProps = {
    Table,
    Row,
    Cell: enhanceCell(Cell),
    DataViewer,
    DataEditor,
    getValue,
    getType,
    getSelectTypes,
    getBindingsForCell
  };

  formulaParser = new FormulaParser();

  clip = () => {
    const { data, selected, getValue } = this.props;
    const startPoint = PointSet.min(selected);
    const endPoint = PointSet.max(selected);
    const slicedMatrix = Matrix.slice(startPoint, endPoint, data);
    const valueMatrix = Matrix.map((value, point) => {
      // Slice makes non-existing cells undefined, empty cells are classically
      // translated to an empty string in join()
      if (value === undefined) {
        return "";
      }
      return getValue({ ...point, data: value });
    }, slicedMatrix);
    writeTextToClipboard(Matrix.join(valueMatrix));
  };

  getKeyDownHandler = event => {
    const { key } = event;
    let handlers;
    // Order matters
    if (this.props.mode === "edit") {
      handlers = this.editKeyDownHandlers;
    } else if (event.shiftKey) {
      handlers = this.shiftKeyDownHandlers;
    } else {
      handlers = this.keyDownHandlers;
    }
    return handlers[key];
  };

  onKeyDown = event => {
    const handler = this.getKeyDownHandler(event);
    if (handler) {
      return this.props.dispatch(handler);
    }
    return null;
  };

  isFocused() {
    const { activeElement } = document;
    return this.root
      ? this.root === activeElement || this.root.contains(activeElement)
      : false;
  }

  componentDidMount() {
    const { copy, cut, paste, data } = this.props;
    document.addEventListener("copy", event => {
      if (this.isFocused()) {
        event.preventDefault();
        event.stopPropagation();
        this.clip();
        copy();
      }
    });
    document.addEventListener("cut", event => {
      if (this.isFocused()) {
        event.preventDefault();
        event.stopPropagation();
        this.clip();
        cut();
      }
    });
    document.addEventListener("paste", event => {
      if (this.isFocused()) {
        event.preventDefault();
        event.stopPropagation();
        paste();
      }
    });
    this.formulaParser.on("callCellValue", (cellCoord, done) => {
      let value;
      try {
        const cell = Matrix.get(
          cellCoord.row.index,
          cellCoord.column.index,
          data
        );
        value = getValue({ data: cell });
      } catch (error) {
        console.error(error);
      } finally {
        done(value);
      }
    });
    this.formulaParser.on(
      "callRangeValue",
      (startCellCoord, endCellCoord, done) => {
        const startPoint = {
          row: startCellCoord.row.index,
          column: startCellCoord.column.index
        };
        const endPoint = {
          row: endCellCoord.row.index,
          column: endCellCoord.column.index
        };
        const values = Matrix.toArray(
          Matrix.slice(startPoint, endPoint, data)
        ).map(cell => getValue({ data: cell }));
        done(values);
      }
    );
  }

  handleKeyDown = event => {
    if (this.getKeyDownHandler(event)) {
      event.nativeEvent.preventDefault();
    }
    this.onKeyDown(event);
  };

  handleMouseUp = () => {
    this.props.onDragEnd();
    document.removeEventListener("mouseup", this.handleMouseUp);
  };

  handleMouseMove = event => {
    if (!this.props.dragging && event.buttons === 1) {
      this.props.onDragStart();
      document.addEventListener("mouseup", this.handleMouseUp);
    }
  };

  handleRoot = root => {
    this.root = root;
  };

  render() {
    const {
      Table,
      Row,
      Cell,
      columnLabels,
      DataViewer,
      getValue,
      rows,
      columns,
      onKeyPress,
      getBindingsForCell,
      hideColumnIndicators,
      hideRowIndicators,
      hasError
    } = this.props;
    return (
      <div
        ref={this.handleRoot}
        className="Spreadsheet"
        onKeyPress={onKeyPress}
        onKeyDown={this.handleKeyDown}
        onMouseMove={this.handleMouseMove}
      >
        <Table>
          <tr>
            {!hideRowIndicators && !hideColumnIndicators && <th />}
            {!hideColumnIndicators &&
              range(columns).map(columnNumber =>
                columnLabels ? (
                  <ColumnIndicator
                    key={columnNumber}
                    column={columnNumber}
                    label={
                      columnNumber in columnLabels
                        ? columnLabels[columnNumber]
                        : null
                    }
                  />
                ) : (
                  <ColumnIndicator key={columnNumber} column={columnNumber} />
                )
              )}
          </tr>
          {range(rows).map(rowNumber => (
            <Row key={rowNumber}>
              {!hideRowIndicators && (
                <RowIndicator key={rowNumber} row={rowNumber} />
              )}
              {range(columns).map(columnNumber => (
                <Cell
                  key={columnNumber}
                  row={rowNumber}
                  column={columnNumber}
                  DataViewer={DataViewer}
                  getValue={getValue}
                  getType={getType}
                  getSelectTypes={getSelectTypes}
                  formulaParser={this.formulaParser}
                />
              ))}
            </Row>
          ))}
        </Table>
        <ActiveCell
          DataEditor={DataEditor}
          getValue={getValue}
          getType={getType}
          getSelectTypes={getSelectTypes}
          getBindingsForCell={getBindingsForCell}
          hasError={hasError}
        />
        <Selected />
        <Copied />
      </div>
    );
  }
}

const mapStateToProps = ({ data, selected, mode, columnLabels }) => ({
  data,
  selected,
  mode,
  columnLabels,
  ...Matrix.getSize(data)
});

const mapDispatchToProps = dispatch => ({
  dispatch,
  go: (rowDelta, columnDelta) => dispatch(actions.go(rowDelta, columnDelta)),
  edit: () => dispatch(actions.edit()),
  unFocus: () => dispatch(actions.unFocus()),
  view: () => dispatch(actions.view()),
  modifyEdge: (field, delta) => dispatch(actions.modifyEdge(field, delta)),
  copy: () => dispatch(actions.copy()),
  cut: () => dispatch(actions.cut()),
  paste: () => dispatch(actions.paste()),
  onKeyPress: () => dispatch(actions.keyPress()),
  onDragStart: () => dispatch(actions.dragStart()),
  onDragEnd: () => dispatch(actions.dragEnd()),
  hasError: cellPointer => dispatch(actions.hasError(cellPointer))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Spreadsheet);
