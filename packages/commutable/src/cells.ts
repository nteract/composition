import { ImmutableOutput } from "./outputs";

import { ExecutionCount } from "./primitives";

import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record,
  RecordOf
} from "immutable";

/* CodeCell Record Boilerplate */

type CodeCellParams = {
  cell_type: "code";
  // Sadly untyped and widely unspecced
  metadata: ImmutableMap<string, any>;
  execution_count: ExecutionCount;
  source: string;
  outputs: ImmutableList<ImmutableOutput>;
};
export const makeCodeCell = Record<CodeCellParams>({
  cell_type: "code",
  execution_count: null,
  metadata: ImmutableMap({
    collapsed: false,
    outputHidden: false,
    inputHidden: false
  }),
  source: "",
  outputs: ImmutableList()
});

export type ImmutableCodeCell = RecordOf<CodeCellParams>;

/* MarkdownCell Record Boilerplate */

type MarkdownCellParams = {
  cell_type: "markdown";
  source: string;
  metadata: ImmutableMap<string, any>;
};

export const makeMarkdownCell = Record<MarkdownCellParams>({
  cell_type: "markdown",
  metadata: ImmutableMap(),
  source: ""
});

export type ImmutableMarkdownCell = RecordOf<MarkdownCellParams>;

/* RawCell Record Boilerplate */

type RawCellParams = {
  cell_type: "raw";
  source: string;
  metadata: ImmutableMap<string, any>;
};

export const makeRawCell = Record<RawCellParams>({
  cell_type: "raw",
  metadata: ImmutableMap(),
  source: ""
});

export type ImmutableRawCell = RecordOf<RawCellParams>;

export type ImmutableCell =
  | ImmutableMarkdownCell
  | ImmutableCodeCell
  | ImmutableRawCell;
