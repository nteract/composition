/* @flow */

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

import type {
  JSONType,
  JSONObject,
  ImmutableNotebook,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableCell,
  ImmutableOutput,
  ImmutableMimeBundle
} from "./types";

import type { CellStructure } from "./structures";

const Immutable = require("immutable");
const appendCell = require("./structures").appendCell;

export type ExecutionCount = number | null;

//
// MimeBundle example (disk format)
//
// {
//   "application/json": {"a": 3, "b": 2},
//   "text/html": ["<p>\n", "Hey\n", "</p>"],
//   "text/plain": "Hey"
// }
//
export type MimeBundle = { [key: string]: string | Array<string> | Object };

// On disk multi-line strings are used to accomodate line-by-line diffs in tools
// like git and GitHub. They get converted to strings for the in-memory format.
export type MultiLineString = string | Array<string>;

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                             Output Types
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export type ExecuteResult = {|
  output_type: "execute_result",
  execution_count: ExecutionCount,
  data: MimeBundle,
  metadata: JSONObject
|};

export type DisplayData = {|
  output_type: "display_data",
  data: MimeBundle,
  metadata: JSONObject
|};

export type StreamOutput = {|
  output_type: "stream",
  name: "stdout" | "stderr",
  text: MultiLineString
|};

export type ErrorOutput = {|
  output_type: "error" | "pyerr",
  ename: string,
  evalue: string,
  traceback: Array<string>
|};

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                              Cell Types
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export type CodeCell = {|
  cell_type: "code",
  metadata: JSONObject,
  execution_count: ExecutionCount,
  source: MultiLineString,
  outputs: Array<Output>
|};

export type MarkdownCell = {|
  cell_type: "markdown",
  metadata: JSONObject,
  source: MultiLineString
|};

export type RawCell = {|
  cell_type: "raw",
  metadata: JSONObject,
  source: MultiLineString
|};

export type Cell = CodeCell | MarkdownCell | RawCell;

export type Notebook = {|
  cells: Array<Cell>,
  metadata: Object,
  nbformat: 4,
  nbformat_minor: number
|};

function demultiline(s: string | Array<string>) {
  if (Array.isArray(s)) {
    return s.join("");
  }
  return s;
}

/**
 * Split string into a list of strings delimited by newlines
 */
function remultiline(s: string | Array<string>): Array<string> {
  if (Array.isArray(s)) {
    // Assume
    return s;
  }
  // Use positive lookahead regex to split on newline and retain newline char
  return s.split(/(.+?(?:\r\n|\n))/g).filter(x => x !== "");
}

function isJSONKey(key) {
  return /^application\/(.*\+)?json$/.test(key);
}

export function cleanMimeData(
  key: string,
  data: string | Array<string> | Object
) {
  // See https://github.com/jupyter/nbformat/blob/62d6eb8803616d198eaa2024604d1fe923f2a7b3/nbformat/v4/nbformat.v4.schema.json#L368
  if (isJSONKey(key)) {
    // Data stays as is for JSON types
    return data;
  }

  if (typeof data === "string" || Array.isArray(data)) {
    return demultiline(data);
  }

  throw new TypeError(
    `Data for ${key} is expected to be a string or an Array of strings`
  );
}

export function cleanMimeAtKey(
  mimeBundle: MimeBundle,
  previous: ImmutableMimeBundle,
  key: string
): ImmutableMimeBundle {
  return previous.set(key, cleanMimeData(key, mimeBundle[key]));
}

export function createImmutableMimeBundle(
  mimeBundle: MimeBundle
): ImmutableMimeBundle {
  // Map over all the mimetypes, turning them into our in-memory format
  //
  // {
  //   "application/json": {"a": 3, "b": 2},
  //   "text/html": ["<p>\n", "Hey\n", "</p>"],
  //   "text/plain": "Hey"
  // }
  //
  // to
  //
  // {
  //   "application/json": {"a": 3, "b": 2},
  //   "text/html": "<p>\nHey\n</p>",
  //   "text/plain": "Hey"
  // }
  //
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

export function createImmutableOutput(output: Output): ImmutableOutput {
  switch (output.output_type) {
    case "execute_result":
      return Immutable.Map(
        Object.assign(
          {},
          {
            output_type: output.output_type,
            execution_count: output.execution_count,
            data: createImmutableMimeBundle(output.data)
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
            data: createImmutableMimeBundle(output.data)
          },
          sanitize(output)
        )
      );
    case "stream":
      return Immutable.Map({
        output_type: output.output_type,
        name: output.name,
        text: demultiline(output.text)
      });
    case "error":
      return Immutable.Map({
        output_type: "error",
        ename: output.ename,
        evalue: output.evalue,
        // Note: this is one of the cases where the Array of strings (for traceback)
        // is part of the format, not a multiline string
        traceback: Immutable.List(output.traceback)
      });
    default:
      throw new TypeError(`Output type ${output.output_type} not recognized`);
  }
}

function createImmutableRawCell(cell: RawCell): ImmutableRawCell {
  // $FlowFixMe: Immutable
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata)
  });
}

function createImmutableMarkdownCell(
  cell: MarkdownCell
): ImmutableMarkdownCell {
  // $FlowFixMe: Immutable
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata)
  });
}

function createImmutableCodeCell(cell: CodeCell): ImmutableCodeCell {
  // $FlowFixMe: Immutable
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    // $FlowFixMe: Immutable
    outputs: new Immutable.List(cell.outputs.map(createImmutableOutput)),
    execution_count: cell.execution_count,
    metadata: Immutable.fromJS(cell.metadata)
  });
}

function createImmutableCell(cell: Cell): ImmutableCell {
  switch (cell.cell_type) {
    case "markdown":
      return createImmutableMarkdownCell(cell);
    case "code":
      return createImmutableCodeCell(cell);
    case "raw":
      return createImmutableRawCell(cell);
    default:
      throw new TypeError(`Cell type ${cell.cell_type} unknown`);
  }
}

export function fromJS(notebook: Notebook): ImmutableNotebook {
  if (notebook.nbformat !== 4 || notebook.nbformat_minor < 0) {
    throw new TypeError(
      `Notebook is not a valid v4 notebook. v4 notebooks must be of form 4.x
       It lists nbformat v${notebook.nbformat}.${notebook.nbformat_minor}`
    );
  }

  // Since we're doing N cell operations all at once, switch to mutable then
  // switch back after.
  const starterCellStructure = {
    cellOrder: Immutable.List().asMutable(),
    cellMap: Immutable.Map().asMutable()
  };

  const cellStructure = notebook.cells.reduce(
    (cellStruct: CellStructure, cell: Cell) =>
      appendCell(cellStruct, createImmutableCell(cell)),
    starterCellStructure
  );

  return Immutable.Map({
    cellOrder: cellStructure.cellOrder.asImmutable(),
    cellMap: cellStructure.cellMap.asImmutable(),
    nbformat_minor: notebook.nbformat_minor,
    nbformat: 4,
    metadata: Immutable.fromJS(notebook.metadata)
  });
}

type PlainNotebook = {|
  cellOrder: Immutable.List<string>,
  cellMap: Immutable.Map<string, ImmutableCell>,
  metadata: Immutable.Map<string, any>,
  nbformat: 4,
  nbformat_minor: number
|};

function markdownCellToJS(immCell: ImmutableCell): MarkdownCell {
  // $FlowFixMe: With Immutable we can not properly type this
  const cell: Cell = immCell.toObject();

  // $FlowFixMe: Fails now as a result of the above.
  return {
    cell_type: "markdown",
    source: remultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata)
  };
}

function mimeBundleToJS(immMimeBundle: ImmutableMimeBundle): MimeBundle {
  const bundle = immMimeBundle.toObject();

  Object.keys(bundle).map(key => {
    if (isJSONKey(key)) {
      if (Immutable.Map.isMap(bundle[key])) {
        bundle[key] = bundle[key].toJS();
      }
      return bundle;
    }

    const data = bundle[key];

    if (typeof data === "string" || Array.isArray(data)) {
      bundle[key] = remultiline(data);
      return bundle;
    }
    throw new TypeError(
      `Data for ${key} is expected to be a string or an Array of strings`
    );
  });

  return bundle;
}

function outputToJS(immOutput: ImmutableOutput): Output {
  // Technically this is an intermediate output with Immutables inside
  const output = immOutput.toObject();

  switch (output.output_type) {
    case "execute_result":
      return {
        output_type: output.output_type,
        execution_count: output.execution_count,
        data: mimeBundleToJS(output.data),
        metadata: output.metadata.toJS()
      };
    case "display_data":
      return {
        output_type: output.output_type,
        data: mimeBundleToJS(output.data),
        metadata: output.metadata.toJS()
      };
    case "stream":
      return {
        output_type: output.output_type,
        name: output.name,
        text: remultiline(output.text)
      };
    case "error":
      // Note: this is one of the cases where the Array of strings (for traceback)
      // is part of the format, not a multiline string
      // $FlowFixMe: Need to expand scope of Output type.
      return immOutput.toJS();
    default:
      throw new TypeError(`Output type ${output.output_type} not recognized`);
  }
}

type IntermediateCodeCell = {|
  cell_type: "code",
  metadata: Immutable.Map<string, JSONType>,
  execution_count: ExecutionCount,
  source: string,
  outputs: Immutable.List<ImmutableOutput>
|};

function codeCellToJS(immCell: ImmutableCell): CodeCell {
  // $FlowFixMe: With Immutable we can not properly type this
  const cell: IntermediateCodeCell = immCell.toObject();

  // $FlowFixMe: Ditto above.
  return {
    cell_type: "code",
    source: remultiline(cell.source),
    outputs: cell.outputs.map(outputToJS).toArray(),
    execution_count: cell.execution_count,
    metadata: Immutable.fromJS(cell.metadata)
  };
}

function rawCellToJS(immCell: ImmutableCell): RawCell {
  // $FlowFixMe: With Immutable we can not properly type this
  const cell: Cell = immCell.toObject();

  // $FlowFixMe: Ditto above. Cells should be Records.
  return {
    cell_type: "raw",
    source: remultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata)
  };
}

function cellToJS(immCell: ImmutableCell): Cell {
  // $FlowFixMe: Cell needs to be a typed record.
  const cellType: "markdown" | "raw" | "code" = immCell.get("cell_type");
  switch (cellType) {
    case "markdown":
      return markdownCellToJS(immCell);
    case "code":
      return codeCellToJS(immCell);
    case "raw":
      return rawCellToJS(immCell);
    default:
      throw new TypeError(`Cell type ${cellType} unknown`);
  }
}

export function toJS(immnb: ImmutableNotebook): Notebook {
  // $FlowFixMe: With Immutable we can not properly type this
  const plainNotebook: PlainNotebook = immnb.toObject();

  const plainCellOrder: Array<string> = plainNotebook.cellOrder.toArray();
  const plainCellMap: {
    [key: string]: ImmutableCell
  } = plainNotebook.cellMap.toObject();

  const cells = plainCellOrder.map((cellID: string) =>
    cellToJS(plainCellMap[cellID])
  );

  return {
    cells,
    metadata: plainNotebook.metadata.toJS(),
    nbformat: plainNotebook.nbformat,
    nbformat_minor: plainNotebook.nbformat_minor
  };
}
