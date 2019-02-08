import React from "react";
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
    padding: "2px 8px",
    opacity: 0.9
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.9 : 1;
    const transition = "opacity 300ms";

    return { ...provided, opacity, transition };
  }
};

const toView = value => {
  if (value === false) {
    return <div className="boolean">FALSE</div>;
  }
  if (value === true) {
    return <div className="boolean">TRUE</div>;
  }
  return value;
};

const DataViewer = ({
  getValue,
  getType,
  getSelectTypes,
  cell,
  column,
  row,
  formulaParser
}) => {
  const rawValue = getValue({ data: cell, column, row });
  const type = getType({ data: cell, column, row });
  const selectTypes = getSelectTypes({ column, row, data: cell });
  if (type === "select" && rawValue) {
    return (
      <Select
        options={selectTypes}
        styles={customStyles}
        value={rawValue}
        isDisabled
      />
    );
  } else if (type === "select") {
    return (
      <Select
        options={selectTypes}
        styles={customStyles}
        isDisabled
      />
    );
  } else {
    if (typeof rawValue === "string" && rawValue.startsWith("=")) {
      const { result, error } = formulaParser.parse(rawValue.slice(1));
      return error || toView(result);
    }
    return toView(rawValue);
  }
};

export default DataViewer;
