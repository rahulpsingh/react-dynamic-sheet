import React, { Component } from "react";

import CreatableSelect from "react-select/lib/Creatable";

const components = {
  DropdownIndicator: null
};

const createOption = label => ({
  label,
  value: label
});

class CreateSelect extends Component {
  state = {
    inputValue: "",
    value: []
  };
  handleChange = (value, actionMeta) => {
    this.setState({ value });
  };
  handleInputChange = inputValue => {
    this.setState({ inputValue });
  };
  handleKeyDown = event => {
    const { inputValue, value } = this.state;
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        this.setState(
          {
            inputValue: "",
            value: [...value, createOption(inputValue)]
          },
          () => this.props.onChange(this.state.value)
        );
        event.preventDefault();
        break;
      default:
        break;
    }
  };
  render() {
    const { inputValue, value } = this.state;
    return (
      <CreatableSelect
        components={components}
        inputValue={inputValue}
        className={this.props.className}
        menuIsOpen={false}
        onChange={this.handleChange}
        onInputChange={this.handleInputChange}
        onKeyDown={this.handleKeyDown}
        placeholder="Add select values, press enter for each..."
        value={value}
        isClearable
        isMulti
      />
    );
  }
}

export default CreateSelect;
