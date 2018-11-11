import {
  Map as ImmutableMap,
  fromJS as immutableFromJS,
  List as ImmutableList
} from "immutable";

import { MultiLineString, JSONObject } from "./primitives";

import { makeNotebookRecord } from "./notebook";

import {
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  makeCodeCell,
  makeRawCell,
  makeMarkdownCell
} from "./cells";

import {
  ImmutableOutput,
  ImmutableMimeBundle,
  makeExecuteResult,
  makeDisplayData,
  makeStreamOutput,
  makeErrorOutput,
  demultiline,
  cleanMimeAtKey
} from "./outputs";

import { CellStructure, appendCell } from "./structures";
import { ErrorOutput, RawCell, MarkdownCell } from "./v4";

const VALID_MIMETYPES = {
  text: "text/plain",
  latex: "text/latex",
  png: "image/png",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  html: "text/html",
  javascript: "application/x-javascript",
  json: "application/javascript",
  pdf: "application/pdf"
};
type MimeTypeKey = keyof typeof VALID_MIMETYPES;
type MimePayload = { [P in MimeTypeKey]?: MultiLineString };

interface MimeOutput<T extends string = string> extends MimePayload {
  output_type: T;
  prompt_number?: number;
  metadata: object;
}

export interface ExecuteResult extends MimeOutput<"pyout"> {}
export interface DisplayData extends MimeOutput<"display_data"> {}

export interface StreamOutput {
  output_type: "stream";
  stream: string;
  text: MultiLineString;
}

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

export interface HeadingCell {
  cell_type: "heading";
  metadata: JSONObject;
  source: MultiLineString;
  level: number;
}

export interface CodeCell {
  cell_type: "code";
  language: string;
  collapsed: boolean;
  metadata: JSONObject;
  input: MultiLineString;
  prompt_number: number;
  outputs: Array<Output>;
}

export type Cell = RawCell | MarkdownCell | HeadingCell | CodeCell;

export interface Worksheet {
  cells: Cell[];
  metadata: object;
}

export type Notebook = {
  worksheets: Worksheet[];
  metadata: object;
  nbformat: 3;
  nbformat_minor: number;
};

const createImmutableMarkdownCell = (
  cell: MarkdownCell
): ImmutableMarkdownCell =>
  makeMarkdownCell({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: immutableFromJS(cell.metadata)
  });

const createImmutableMimeBundle = (output: MimeOutput): ImmutableMimeBundle => {
  const mimeBundle: { [key: string]: MultiLineString | undefined } = {};
  for (const key of Object.keys(output)) {
    // v3 had non-media types for rich media
    if (key in VALID_MIMETYPES) {
      mimeBundle[VALID_MIMETYPES[key as MimeTypeKey]] =
        output[key as keyof MimePayload];
    }
  }
  return Object.keys(mimeBundle).reduce(
    cleanMimeAtKey.bind(null, mimeBundle),
    ImmutableMap()
  );
};

const createImmutableOutput = (output: Output): ImmutableOutput => {
  switch (output.output_type) {
    case "pyout":
      return makeExecuteResult({
        execution_count: output.prompt_number,
        // Note strangeness with v4 API
        data: createImmutableMimeBundle(output),
        metadata: immutableFromJS(output.metadata)
      });
    case "display_data":
      return makeDisplayData({
        data: createImmutableMimeBundle(output),
        metadata: immutableFromJS(output.metadata)
      });
    case "stream":
      // Default to stdout in all cases unless it's stderr
      const name = output.stream === "stderr" ? "stderr" : "stdout";

      return makeStreamOutput({
        name,
        text: demultiline(output.text)
      });
    case "pyerr":
      return makeErrorOutput({
        ename: output.ename,
        evalue: output.evalue,
        traceback: ImmutableList(output.traceback)
      });
    default:
      throw new TypeError(`Output type ${output.output_type} not recognized`);
  }
};

const createImmutableCodeCell = (cell: CodeCell): ImmutableCodeCell =>
  makeCodeCell({
    cell_type: cell.cell_type,
    source: demultiline(cell.input),
    outputs: ImmutableList(cell.outputs.map(createImmutableOutput)),
    execution_count: cell.prompt_number,
    metadata: immutableFromJS(cell.metadata)
  });

const createImmutableRawCell = (cell: RawCell): ImmutableRawCell =>
  makeRawCell({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: immutableFromJS(cell.metadata)
  });

const createImmutableHeadingCell = (cell: HeadingCell): ImmutableMarkdownCell =>
  // v3 heading cells are just markdown cells in v4+
  makeMarkdownCell({
    cell_type: "markdown",
    source: Array.isArray(cell.source)
      ? demultiline(
          cell.source.map(line =>
            Array(cell.level)
              .join("#")
              .concat(" ")
              .concat(line)
          )
        )
      : cell.source,
    metadata: immutableFromJS(cell.metadata)
  });

const createImmutableCell = (cell: Cell) => {
  switch (cell.cell_type) {
    case "markdown":
      return createImmutableMarkdownCell(cell);
    case "code":
      return createImmutableCodeCell(cell);
    case "raw":
      return createImmutableRawCell(cell);
    case "heading":
      return createImmutableHeadingCell(cell);
    default:
      throw new TypeError(`Cell type ${(cell as any).cell_type} unknown`);
  }
};

export const fromJS = (notebook: Notebook) => {
  if (notebook.nbformat !== 3 || notebook.nbformat_minor < 0) {
    throw new TypeError(
      `Notebook is not a valid v3 notebook. v3 notebooks must be of form 3.x
      It lists nbformat v${notebook.nbformat}.${notebook.nbformat_minor}`
    );
  }

  const starterCellStructure = {
    cellOrder: ImmutableList().asMutable(),
    cellMap: ImmutableMap().asMutable()
  };

  const cellStructure = [].concat.apply(
    [],
    notebook.worksheets.map(worksheet =>
      worksheet.cells.reduce(
        (cellStruct, cell) => appendCell(cellStruct, createImmutableCell(cell)),
        starterCellStructure as CellStructure
      )
    )
  )[0];

  return makeNotebookRecord({
    cellOrder: cellStructure.cellOrder.asImmutable(),
    cellMap: cellStructure.cellMap.asImmutable(),
    nbformat_minor: notebook.nbformat_minor,
    nbformat: 4,
    metadata: immutableFromJS(notebook.metadata)
  });
};
