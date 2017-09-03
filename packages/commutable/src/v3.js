/* @flow */
/* eslint-disable array-callback-return, prefer-spread */
import type {
  JSONObject,
  ImmutableNotebook,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableOutput,
  ImmutableMimeBundle
} from "./types";

import type { CellStructure } from "./structures";

import type { MultiLineString, ErrorOutput, RawCell, MarkdownCell } from "./v4";

import { cleanMimeAtKey } from "./v4";

const Immutable = require("immutable");
const appendCell = require("./structures").appendCell;

function demultiline(s: string | Array<string>) {
  if (Array.isArray(s)) {
    return s.join("");
  }
  return s;
}

export type ExecuteResult = {|
  output_type: "pyout",
  prompt_number: number,
  metadata: Object,
  text?: MultiLineString,
  latex?: MultiLineString,
  png?: MultiLineString,
  jpeg?: MultiLineString,
  svg?: MultiLineString,
  html?: MultiLineString,
  javascript?: MultiLineString,
  json?: MultiLineString,
  pdf?: MultiLineString
|};

export type DisplayData = {|
  output_type: "display_data",
  metadata: Object,
  prompt_number?: number,
  text?: MultiLineString,
  latex?: MultiLineString,
  png?: MultiLineString,
  jpeg?: MultiLineString,
  svg?: MultiLineString,
  html?: MultiLineString,
  javascript?: MultiLineString,
  json?: MultiLineString,
  pdf?: MultiLineString
|};

export type StreamOutput = {|
  output_type: "stream",
  stream: string,
  text: MultiLineString
|};

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

export type HeadingCell = {|
  cell_type: "heading",
  metadata: JSONObject,
  source: MultiLineString,
  level: number
|};

export type CodeCell = {|
  cell_type: "code",
  language: string,
  collapsed: boolean,
  metadata: JSONObject,
  input: MultiLineString,
  prompt_number: number,
  outputs: Array<Output>
|};

export type Cell = RawCell | MarkdownCell | HeadingCell | CodeCell;

export type Worksheet = {|
  cells: Array<Cell>,
  metadata: Object
|};

export type Notebook = {|
  worksheets: Array<Worksheet>,
  metadata: Object,
  nbformat: 3,
  nbformat_minor: number
|};

function createImmutableMarkdownCell(cell) {
  // $FlowFixMe: Immutable
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata)
  });
}

function createImmutableMimeBundle(
  output: DisplayData | ExecuteResult
): ImmutableMimeBundle {
  const VALID_MIMETYPES = {
    text: "text/plain",
    latex: "text/latex",
    png: "image/png",
    jpeg: "image/jpeg",
    svg: "image/svg+xml",
    html: "text/html",
    javascript: "application/x-javascript",
    json: "application/javascript",
    pdf: "application/pdf",
    metadata: "",
    prompt_number: "",
    output_type: ""
  };
  const mimeBundle = {};
  Object.keys(output).map((key: string) => {
    if (
      key !== "prompt_number" ||
      key !== "metadata" ||
      key !== "output_type"
    ) {
      mimeBundle[VALID_MIMETYPES[key]] = output[key];
    }
  });
  return Object.keys(mimeBundle).reduce(
    cleanMimeAtKey.bind(null, mimeBundle),
    Immutable.Map()
  );
}

function sanitize(o: ExecuteResult | DisplayData) {
  if (o.metadata) {
    return { metadata: Immutable.fromJS(o.metadata) };
  }
  return {};
}

function createImmutableOutput(output: Output): ImmutableOutput {
  switch (output.output_type) {
    case "pyout":
      return Immutable.Map(
        Object.assign(
          {},
          {
            output_type: output.output_type,
            execution_count: output.prompt_number,
            data: createImmutableMimeBundle(output)
          },
          sanitize(output)
        )
      );
    case "display_data":
      return Immutable.Map(
        Object.assign(
          {},
          {
            output_type: output.output_type,
            data: createImmutableMimeBundle(output)
          },
          sanitize(output)
        )
      );
    case "stream":
      return Immutable.Map({
        output_type: output.output_type,
        name: output.stream,
        text: demultiline(output.text)
      });
    case "pyerr":
      return Immutable.Map({
        output_type: "error",
        ename: output.ename,
        evalue: output.evalue,
        traceback: Immutable.List(output.traceback)
      });
    default:
      throw new TypeError(`Output type ${output.output_type} not recognized`);
  }
}

function createImmutableCodeCell(cell): ImmutableCodeCell {
  // $FlowFixMe: Immutable
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.input),
    // $FlowFixMe: Immutable
    outputs: new Immutable.List(cell.outputs.map(createImmutableOutput)),
    execution_count: cell.prompt_number,
    metadata: Immutable.fromJS(cell.metadata)
  });
}

function createImmutableRawCell(cell: RawCell): ImmutableRawCell {
  // $FlowFixMe: Immutable
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata)
  });
}

function createImmutableHeadingCell(cell: HeadingCell): ImmutableMarkdownCell {
  // $FlowFixMe: Immutable
  return new Immutable.Map({
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
    metadata: Immutable.fromJS(cell.metadata)
  });
}

function createImmutableCell(cell) {
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
      throw new TypeError(`Cell type ${cell.cell_type} unknown`);
  }
}

export function fromJS(notebook: Notebook): ImmutableNotebook {
  if (notebook.nbformat !== 3 || notebook.nbformat_minor < 0) {
    throw new TypeError(
      `Notebook is not a valid v3 notebook. v3 notebooks must be of form 3.x
      It lists nbformat v${notebook.nbformat}.${notebook.nbformat_minor}`
    );
  }

  const starterCellStructure = {
    cellOrder: Immutable.List().asMutable(),
    cellMap: Immutable.Map().asMutable()
  };

  const cellStructure = [].concat.apply(
    [],
    notebook.worksheets.map(worksheet =>
      worksheet.cells.reduce(
        (cellStruct: CellStructure, cell: Cell) =>
          appendCell(cellStruct, createImmutableCell(cell)),
        starterCellStructure
      )
    )
  )[0];

  return Immutable.Map({
    cellOrder: cellStructure.cellOrder.asImmutable(),
    cellMap: cellStructure.cellMap.asImmutable(),
    nbformat_minor: notebook.nbformat_minor,
    nbformat: 4,
    metadata: Immutable.fromJS(notebook.metadata)
  });
}
