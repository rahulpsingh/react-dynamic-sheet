import React from "react";
import { connect } from "react-redux";

import Spreadsheet from "./../components/Spreadsheet";
import * as actions from "./../actions";
import Controls from "./Controls";
import "./index.css";

const Sheet = ({ addRow, addColumn, data }) => {
  return (
    <div className="main-wrapper">
      <div className="panel-wrapper">
        <h1 className="panel-head">Dynamic Spreadsheet!</h1>
        <Controls addColumn={addColumn} addRow={addRow} />
      </div>
      <div className="sheet-wrapper">
        {data.filter(x => x.length !== 0).length > 0 ? (
          <Spreadsheet />
        ) : (
          <div className="empty-page">
            <h1 style={{ color: "rgba(0, 0, 0, 0.6)" }}>
              Please start from creating a column in the left panel!!
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  data: state.data
});

const mapDispatchToProps = dispatch => ({
  addRow: () => dispatch(actions.addRow()),
  addColumn: (name, type, required, createdSelectTypes) =>
    dispatch(actions.addColumn(name, type, required, createdSelectTypes))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sheet);
