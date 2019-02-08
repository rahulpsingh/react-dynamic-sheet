import { extractLabel } from "hot-formula-parser/lib/helper/cell";

function isFormulaCell(cell) {
  return Boolean(
    cell &&
      cell.value &&
      typeof cell.value === "string" &&
      cell.value.startsWith("=")
  );
}

const FORMULA_CELL_REFERENCES = /\$?[A-Z]+\$?[0-9]+/g;

export function getBindingsForCell(cell) {
  if (!isFormulaCell(cell)) {
    return [];
  }
  const { value } = cell;
  // Get raw cell references from formula
  const match = value.match(FORMULA_CELL_REFERENCES);
  if (!match) {
    return [];
  }
  // Normalize references to points
  return match.map(substr => {
    const [row, column] = extractLabel(substr);
    return { row: row.index, column: column.index };
  }, {});
}
