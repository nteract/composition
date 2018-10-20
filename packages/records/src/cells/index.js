// @flow

import * as codeCell from "./code-cell";
import * as markdownCell from "./markdown-cell";
import * as rawCell from "./raw-cell";

export * from "./code-cell";
export * from "./markdown-cell";
export * from "./raw-cell";

export type NbformatCell =
  | codeCell.NbformatCodeCell
  | markdownCell.NbformatMarkdownCell
  | rawCell.NbformatRawCell;

export type CellRecord =
  | codeCell.CodeCellRecord
  | markdownCell.MarkdownCellRecord
  | rawCell.RawCellRecord;

/**
 * Turn any output that was in nbformat into a record
 */
export function cellFromNbformat(cell: NbformatCell): CellRecord {
  switch (cell.cell_type) {
    case codeCell.CODECELL:
      return codeCell.codeCellRecordFromNbformat(cell);
    case markdownCell.MARKDOWNCELL:
      return markdownCell.markdownCellRecordFromNbformat(cell);
    case rawCell.RAWCELL:
      return rawCell.rawCellRecordFromNbformat(cell);
    default:
      throw new TypeError(`Cell type ${cell.cell_type} unknown`);
  }
}
