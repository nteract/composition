import { ImmutableOutput } from "./outputs";

import { ExecutionCount, MimeBundle } from "./primitives";

import {
  List as ImmutableList,
  Map as ImmutableMap,
  Record,
  RecordOf,
} from "immutable";

/* CodeCell Record Boilerplate */

export interface CodeCellParams {
  cell_type: "code";
  id?: string;
  // Sadly untyped and widely unspecced
  metadata: ImmutableMap<string, any>;
  execution_count: ExecutionCount;
  source: string;
  outputs: ImmutableList<ImmutableOutput>;
}

export const makeCodeCell = Record<CodeCellParams>({
  cell_type: "code",
  execution_count: null,
  metadata: ImmutableMap({
    jupyter: ImmutableMap({
      source_hidden: false,
      outputs_hidden: false,
    }),
    nteract: ImmutableMap({
      transient: ImmutableMap({
        deleting: false,
      }),
    }),
  }),
  source: "",
  outputs: ImmutableList(),
});

export type ImmutableCodeCell = RecordOf<CodeCellParams>;

/* MarkdownCell Record Boilerplate */

export interface MarkdownCellParams {
  attachments?: ImmutableMap<string, MimeBundle<string>>;
  cell_type: "markdown";
  id?: string;
  source: string;
  metadata: ImmutableMap<string, any>;
  attachments: ImmutableMap<string, ImmutableMap<string, string>>;
}

export const makeMarkdownCell = Record<MarkdownCellParams>({
  attachments: undefined,
  cell_type: "markdown",
  metadata: ImmutableMap({
    nteract: ImmutableMap({
      transient: ImmutableMap({
        deleting: false,
      }),
    }),
  }),
  source: "",
  attachments: ImmutableMap(),
});

export type ImmutableMarkdownCell = RecordOf<MarkdownCellParams>;

/* RawCell Record Boilerplate */

export interface RawCellParams {
  id?: string;
  cell_type: "raw";
  source: string;
  metadata: ImmutableMap<string, any>;
  attachments: ImmutableMap<string, ImmutableMap<string, string>>;
}

export const makeRawCell = Record<RawCellParams>({
  cell_type: "raw",
  metadata: ImmutableMap({
    nteract: ImmutableMap({
      transient: ImmutableMap({
        deleting: false,
      }),
    }),
  }),
  source: "",
  attachments: ImmutableMap(),
});

export type ImmutableRawCell = RecordOf<RawCellParams>;

export type ImmutableCell =
  | ImmutableMarkdownCell
  | ImmutableCodeCell
  | ImmutableRawCell;

export type CellType = "raw" | "markdown" | "code";
