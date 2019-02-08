import React from "react";

const Table = ({ children }) => (
  <table className="SpreadsheetTable">
    <tbody>{children}</tbody>
  </table>
);

export default Table;
