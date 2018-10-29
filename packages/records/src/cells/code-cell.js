// @flow
import produce from "immer";

import { outputFromNbformat } from "../outputs";
import type { JSONObject } from "../types";
import type { MultilineString } from "../common";
import type { OutputType, NbformatOutput } from "../outputs";
import type { ExecutionCount } from "../outputs/execute-result";

export type CodeCellType = "code";
export const CODECELL = "code";

// In-memory version
type CodeCell = {|
  cellType: CodeCellType,
  metadata: JSONObject,
  executionCount: ExecutionCount,
  source: string,
  outputs: Array<OutputType>
|};

// On disk
export type NbformatCodeCell = {
  cell_type: CodeCellType,
  metadata: JSONObject,
  execution_count: ExecutionCount,
  source: MultilineString,
  outputs: Array<NbformatOutput>
};

export type CodeCellRecord = JSONObject;

export const makeCodeCellRecord: Function = (codeCell: CodeCell) => {
  const defaultCodeCell = {
    cellType: "code",
    metadata: {},
    executionCount: undefined,
    source: "",
    outputs: []
  };

  return produce(defaultCodeCell, draft => Object.assign(draft, codeCell));
};

export function codeCellRecordFromNbformat(
  codeCell: NbformatCodeCell
): CodeCellRecord {
  return makeCodeCellRecord({
    cellType: codeCell.cell_type,
    metadata: codeCell.metadata,
    executionCount: codeCell.execution_count,
    source: codeCell.source,
    outputs: codeCell.outputs.map(outputFromNbformat)
  });
}
