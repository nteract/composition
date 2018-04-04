// @flow

import * as Immutable from "immutable";

import type { Metadata } from "./base";

import type { OutputRef, CellRef } from "./refs";

export type CellType = "markdown" | "code" | "raw";

export type CodeCellProps = {
  cellType: "code",
  source: string,
  executionCount: number | null,
  outputs: Immutable.List<OutputRef>,
  // TODO: Some of the metadata should be tightly specced
  //       Others can end up in the generic map
  metadata: Metadata
};
export type CodeCellRecord = Immutable.RecordOf<CodeCellProps>;
const makeCodeCell: Immutable.RecordFactory<CodeCellProps> = Immutable.Record({
  cellType: "code",
  source: "",
  executionCount: null,
  outputs: Immutable.List(),
  metadata: Immutable.Map()
});

export type MarkdownCellProps = {
  cellType: "markdown",
  source: string,
  // TODO: Some of the metadata should be tightly specced
  //       Others can end up in the generic map
  metadata: Metadata
};
export type MarkdownCellRecord = Immutable.RecordOf<MarkdownCellProps>;
const makeMarkdownCell: Immutable.RecordFactory<
  MarkdownCellProps
> = Immutable.Record({
  cellType: "markdown",
  source: "",
  metadata: Immutable.Map()
});

export type RawCellProps = {
  cellType: "raw",
  source: string,
  // TODO: Some of the metadata should be tightly specced
  //       Others can end up in the generic map
  metadata: Metadata
};
export type RawCellRecord = Immutable.RecordOf<RawCellProps>;
const makeRawCell: Immutable.RecordFactory<RawCellProps> = Immutable.Record({
  cellType: "raw",
  source: "",
  metadata: Immutable.Map()
});

export type CellRecord = CodeCellRecord | MarkdownCellRecord | RawCellRecord;

/**
 * Cell
 */
export type CellsProps = {|
  byRef: Immutable.Map<CellRef, CellRecord>
|};
export type CellsRecord = Immutable.RecordOf<CellsProps>;
const makeCells: Immutable.RecordFactory<CellsProps> = Immutable.Record({
  byRef: Immutable.Map()
});
