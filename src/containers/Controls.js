import React from "react";
import Select from "react-select";
import CreateSelect from "./CreateSelect";
const options = [
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" }
];

const initialState = {
  colName: "",
  colType: "",
  createdSelectTypes: null,
  required: false,
  colNameErr: false,
  colTypeErr: false,
  cerateSelectTypeErr: false
};

class Controls extends React.Component {
  state = initialState;

  handleNameChange = e => {
    e.preventDefault();
    this.setState({
      colNameErr: false,
      colName: e.target.value
    });
  };
  handleTypeChange = type => {
    this.setState({
      colTypeErr: false,
      colType: type.value
    });
  };
  handleRequiredChange = () =>
    this.setState({ required: !this.state.required });
  addColumn = () => {
    const { colName, colType, required, createdSelectTypes } = this.state;
    if (!colName && !colType) {
      this.setState({
        colNameErr: true,
        colTypeErr: true
      });
    }
    if (!colName) {
      this.setState({
        colNameErr: true
      });
      return;
    }
    if (!colType) {
      this.setState({
        colTypeErr: true
      });
      return;
    }
    if (colType === "select" && !createdSelectTypes) {
      this.setState({
        cerateSelectTypeErr: true
      });
      return;
    }
    this.setState({ ...initialState }, () =>
      colType === "select"
        ? this.props.addColumn(colName, colType, required, createdSelectTypes)
        : this.props.addColumn(colName, colType, required)
    );
  };
  handleCreateChange = values => {
    this.setState({
      cerateSelectTypeErr: false,
      createdSelectTypes: values.map(item => ({
        ...item,
        value: item.value.toLowerCase().replace(" ", "-")
      }))
    });
  };

  render() {
    return (
      <div className="controls">
        <input
          type="text"
          placeholder="Enter the column name..."
          className={`name-input ${this.state.colNameErr ? "input-err" : ""}`}
          value={this.state.colName}
          onChange={this.handleNameChange}
        />
        <Select
          placeholder="Select column type..."
          className={`type-select ${
            this.state.colTypeErr ? "type-input-err" : ""
          }`}
          options={options}
          value={
            options.find(option => option.value === this.state.colType) || ""
          }
          onChange={this.handleTypeChange}
        />
        {this.state.colType === "select" && (
          <CreateSelect
            onChange={this.handleCreateChange}
            className={`type-select ${
              this.state.cerateSelectTypeErr ? "type-input-err" : ""
            }`}
          />
        )}
        <div className="required-field">
          <label>
            <input
              onChange={this.handleRequiredChange}
              type="checkbox"
              name="required"
              className="required-checkbox"
              checked={this.state.required}
            />
            <span>required?</span>
          </label>
        </div>
        <div className="action-btns">
          <button className="btn" onClick={this.props.addRow}>
            Add row
          </button>
          <button className="btn" onClick={this.addColumn}>
            Add column
          </button>
        </div>
      </div>
    );
  }
}

export default Controls;
