// @flow

/*
 * Functions in this module are provided for converting from Jupyter Notebook
 * Format v4 to nteract's in-memory format, affectionately referred to as
 * commutable.
 *
 * See: https://github.com/jupyter/nbformat/blob/62d6eb8803616d198eaa2024604d1fe923f2a7b3/nbformat/v4/nbformat.v4.schema.json
 *
 * The main goal here is consistency and compliance with the v4 spec. The types
 * contained in here (non Immutable ones) are constrained to the disk based
 * notebook format.
 *
 * To assist in the developer experience, types are included through the use of
 * flow.
 *
 */

import uuid from "uuid";
import * as Immutable from "immutable";

export opaque type CellRef: string = string;
export const createCellRef = (): CellRef => uuid.v4();

export type CellType = "markdown" | "code" | "raw";

type Metadata = Immutable.Map<string, JSONType | ImmutableJSON>;

export type NotebookProps = {
  nbformat: string,
  nbformatMinor: string,
  // TODO: Some of the metadata should be tightly specced
  //       Others can end up in the generic map
  metadata: Metadata,
  // ordered list of cells
  cells: Array<CellRef> | Immutable.List<CellRef>
};

export type CodeCellProps = {
  cellType: "code",
  source: string,
  executionCount: number | null,
  outputs: Immutable.List<OutputRecord>,
  // TODO: Some of the metadata should be tightly specced
  //       Others can end up in the generic map
  metadata: Metadata
};

export type CodeCellRecord = Immutable.RecordOf<CodeCellProps>;
const codeCellMaker: Immutable.RecordFactory<CodeCellProps> = Immutable.Record({
  cellType: "code",
  source: "",
  executionCount: null,
  outputs: Immutable.List(),
  metadata: Immutable.Map()
});
export function makeCodeCell(codeCell: CodeCellProps): CodeCellRecord {
  return codeCellMaker(codeCell);
}

// FIXME putting these in as a placeholder
export type CellRecord = CodeCellRecord;

export type CellMap = Immutable.Map<CellRef, CellRecord>;
