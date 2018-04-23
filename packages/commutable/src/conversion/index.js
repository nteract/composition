// @flow

import * as Immutable from "immutable";

import { isPlainObject } from "lodash";

import * as records from "../records";

export function fromJS(json: JSONObject): records.NotebookRecord {
  // Validate by hand (for now), since it allows flow to understand these
  // NOTE: Only handling v4 here

  if (
    typeof json.nbformat !== "string" ||
    typeof json.nbformat_minor !== "string" ||
    typeof json.cells === "undefined" ||
    !Array.isArray(json.cells) ||
    typeof json.metadata === "undefined" ||
    !isPlainObject(json.metadata)
  ) {
    throw new Error("Notebook failed validation");
  }

  // Need to create two objects
  // Map<CellRef, Cell>
  // List<CellRef>

  const cells = json.cells.map((cell: JSONObject): [CellRef, Cell] => {
    if (!isPlainObject(cell) || !isPlainObject(cell.metadata)) {
      throw new Error("cell is not a plain object");
    }

    switch (cell.cell_type) {
      case "code": {
        return records.makeCodeCell({
          source: cell.source,
          executionCount: cell.execution_count,
          outputs: Immutable.List(),
          metadata: Immutable.fromJS(cell.metadata)
        });
      }
    }
  });

  return records.makeNotebook({
    nbformat: json.nbformat,
    nbformatMinor: json.nbformat_minor,
    metadata: Immutable.fromJS(json.metadata),
    cells
  });
}
