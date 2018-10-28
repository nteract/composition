import {
  Map as ImmutableMap,
  fromJS as immutableFromJS,
  List as ImmutableList
} from "immutable";

import {
  ImmutableNotebook,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableOutput,
  ImmutableMimeBundle,
  MultiLineString,
  JSONObject
} from "./types";
import { CellStructure, appendCell } from "./structures";
import {
  demultiline,
  cleanMimeAtKey,
  ErrorOutput,
  RawCell,
  MarkdownCell
} from "./v4";

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

export interface Notebook {
  worksheets: Worksheet[];
  metadata: object;
  nbformat: 3;
  nbformat_minor: number;
}

const createImmutableMarkdownCell = (
  cell: MarkdownCell
): ImmutableMarkdownCell =>
  ImmutableMap({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: immutableFromJS(cell.metadata)
  });

const createImmutableMimeBundle = (output: MimeOutput): ImmutableMimeBundle => {
  const mimeBundle: { [key: string]: MultiLineString | undefined } = {};
  for (const key of Object.keys(output)) {
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

export const sanitize = (o: ExecuteResult | DisplayData) =>
  o.metadata ? { metadata: immutableFromJS(o.metadata) } : {};

const createImmutableOutput = (output: Output): ImmutableOutput => {
  switch (output.output_type) {
    case "pyout":
      return ImmutableMap({
        output_type: output.output_type,
        execution_count: output.prompt_number,
        data: createImmutableMimeBundle(output),
        ...sanitize(output)
      });
    case "display_data":
      return ImmutableMap({
        output_type: output.output_type,
        data: createImmutableMimeBundle(output),
        ...sanitize(output)
      });
    case "stream":
      return ImmutableMap({
        output_type: output.output_type,
        name: output.stream,
        text: demultiline(output.text)
      });
    case "pyerr":
      return ImmutableMap({
        output_type: "error",
        ename: output.ename,
        evalue: output.evalue,
        traceback: ImmutableList(output.traceback)
      });
    default:
      throw new TypeError(`Output type ${output.output_type} not recognized`);
  }
};

const createImmutableCodeCell = (cell: CodeCell): ImmutableCodeCell =>
  ImmutableMap({
    cell_type: cell.cell_type,
    source: demultiline(cell.input),
    outputs: ImmutableList(cell.outputs.map(createImmutableOutput)),
    execution_count: cell.prompt_number,
    metadata: immutableFromJS(cell.metadata)
  });

const createImmutableRawCell = (cell: RawCell): ImmutableRawCell =>
  ImmutableMap({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: immutableFromJS(cell.metadata)
  });

const createImmutableHeadingCell = (cell: HeadingCell): ImmutableMarkdownCell =>
  ImmutableMap({
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

export const fromJS = (notebook: Notebook): ImmutableNotebook => {
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

  return ImmutableMap({
    cellOrder: cellStructure.cellOrder.asImmutable(),
    cellMap: cellStructure.cellMap.asImmutable(),
    nbformat_minor: notebook.nbformat_minor,
    nbformat: 4,
    metadata: immutableFromJS(notebook.metadata)
  });
};
