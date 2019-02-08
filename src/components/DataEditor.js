import React, { PureComponent } from "react";
import Select from "react-select";

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? "red" : "blue",
    padding: 0
  }),
  control: () => ({
    width: "100%",
    height: "1.45em",
    border: 0,
    display: "flex",
    flexDirection: "row"
  }),
  indicatorSeparator: () => ({
    display: "none"
  }),
  dropdownIndicator: () => ({
    padding: "2px 8px"
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = "opacity 300ms";

    return { ...provided, opacity, transition };
  }
};

class DataEditor extends PureComponent {
  static defaultProps = {
    value: ""
  };

  componentWillUnmount() {
    const {
      getValue,
      getType,
      getSelectTypes,
      hasError,
      column,
      row,
      cell
    } = this.props;
    const value = getValue({ column, row, data: cell }) || "";
    const type = getType({ column, row, data: cell }) || "text";
    const isDate = value => !!Date.parse(value);
    const selectTypes = getSelectTypes({ column, row, data: cell });
    const doesExist = val =>
      selectTypes.find(option => option.value === val.value);
    if (
      (cell.required && value === "") ||
      (type === "number" && isNaN(value)) ||
      (type === "date" && !isDate(value)) ||
      (type === "select" && !doesExist(value))
    ) {
      hasError({ row, column });
    }
  }

  handleChange = e => {
    const { onChange, cell } = this.props;
    onChange({ ...cell, value: e.target.value });
  };

  handleInput = input => {
    this.input = input;
  };

  handleSelectChange = value => {
    const { onChange, cell } = this.props;
    onChange({ ...cell, value });
  };

  renderInput = (type, value, selectTypes) => {
    switch (type) {
      case "date":
        return (
          <input
            ref={this.handleInput}
            type="date"
            onChange={this.handleChange}
            value={value}
            autoFocus
          />
        );
      case "select":
        return (
          <Select
            options={selectTypes}
            styles={customStyles}
            onChange={this.handleSelectChange}
          />
        );
      default:
        return (
          <input
            ref={this.handleInput}
            type="text"
            onChange={this.handleChange}
            value={value}
            autoFocus
          />
        );
    }
  };

  render() {
    const { getValue, getType, getSelectTypes, column, row, cell } = this.props;
    const value = getValue({ column, row, data: cell }) || "";
    const type = getType({ column, row, data: cell }) || "text";
    const selectTypes = getSelectTypes({ column, row, data: cell });
    return (
      <div className="DataEditor">
        {this.renderInput(type, value, selectTypes)}
      </div>
    );
  }
}

export default DataEditor;
