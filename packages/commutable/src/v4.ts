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

import {
  Map as ImmutableMap,
  fromJS as immutableFromJS,
  List as ImmutableList,
  Set as ImmutableSet
} from "immutable";

import {
  ImmutableNotebook,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableCell,
  ImmutableOutput,
  ImmutableMimeBundle,
  ExecutionCount,
  JSONObject,
  JSONType,
  MultiLineString
} from "./types";

import { appendCell, CellStructure } from "./structures";

//
// MimeBundle example (disk format)
//
// {
//   "application/json": {"a": 3, "b": 2},
//   "text/html": ["<p>\n", "Hey\n", "</p>"],
//   "text/plain": "Hey"
// }
//
export type MimeBundle = { [key: string]: string | string[] | Object };

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                             Output Types
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

export interface ExecuteResult {
  output_type: "execute_result";
  execution_count: ExecutionCount;
  data: MimeBundle;
  metadata: JSONObject;
}

export interface DisplayData {
  output_type: "display_data";
  data: MimeBundle;
  metadata: JSONObject;
}

export interface StreamOutput {
  output_type: "stream";
  name: "stdout" | "stderr";
  text: MultiLineString;
}

export interface ErrorOutput {
  output_type: "error" | "pyerr";
  ename: string;
  evalue: string;
  traceback: string[];
}

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                              Cell Types
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

export interface CodeCell {
  cell_type: "code";
  metadata: JSONObject;
  execution_count: ExecutionCount;
  source: MultiLineString;
  outputs: Output[];
}

export interface MarkdownCell {
  cell_type: "markdown";
  metadata: JSONObject;
  source: MultiLineString;
}

export interface RawCell {
  cell_type: "raw";
  metadata: JSONObject;
  source: MultiLineString;
}

export type Cell = CodeCell | MarkdownCell | RawCell;

export interface Notebook {
  cells: Array<Cell>;
  metadata: Object;
  nbformat: 4;
  nbformat_minor: number;
}

export const demultiline = (s: string | string[]) =>
  Array.isArray(s) ? s.join("") : s;

/**
 * Split string into a list of strings delimited by newlines
 */
export const remultiline = (s: string | string[]): string[] =>
  Array.isArray(s) ? s : s.split(/(.+?(?:\r\n|\n))/g).filter(x => x !== "");

export const isJSONKey = (key: string) =>
  /^application\/(.*\+)?json$/.test(key);

export const cleanMimeData = (
  key: string,
  data: string | string[] | object
) => {
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
};

export const cleanMimeAtKey = (
  mimeBundle: MimeBundle,
  previous: ImmutableMimeBundle,
  key: string
): ImmutableMimeBundle =>
  previous.set(key, cleanMimeData(key, mimeBundle[key]));

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
export const createImmutableMimeBundle = (
  mimeBundle: MimeBundle
): ImmutableMimeBundle =>
  Object.keys(mimeBundle).reduce(
    cleanMimeAtKey.bind(null, mimeBundle),
    ImmutableMap()
  );

export const sanitize = (o: ExecuteResult | DisplayData) =>
  o.metadata ? { metadata: immutableFromJS(o.metadata) } : {};

export const createImmutableOutput = (output: Output): ImmutableOutput => {
  switch (output.output_type) {
    case "execute_result":
      return ImmutableMap({
        output_type: output.output_type,
        execution_count: output.execution_count,
        data: createImmutableMimeBundle(output.data),
        ...sanitize(output)
      });
    case "display_data":
      return ImmutableMap({
        output_type: output.output_type,
        data: createImmutableMimeBundle(output.data),
        ...sanitize(output)
      });
    case "stream":
      return ImmutableMap({
        output_type: output.output_type,
        name: output.name,
        text: demultiline(output.text)
      });
    case "error":
      return ImmutableMap({
        output_type: "error",
        ename: output.ename,
        evalue: output.evalue,
        // Note: this is one of the cases where the Array of strings (for
        // traceback) is part of the format, not a multiline string
        traceback: ImmutableList(output.traceback)
      });
    default:
      throw new TypeError(`Output type ${output.output_type} not recognized`);
  }
};

const createImmutableMetadata = (metadata: JSONObject) =>
  ImmutableMap(metadata).map((v, k: string) => {
    if (k !== "tags") {
      return v;
    }

    if (Array.isArray(v)) {
      return ImmutableSet(v);
    }

    // The notebook spec requires that this field is an Array of strings
    return ImmutableSet();
  });

const createImmutableRawCell = (cell: RawCell): ImmutableRawCell =>
  ImmutableMap({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: createImmutableMetadata(cell.metadata)
  });

const createImmutableMarkdownCell = (
  cell: MarkdownCell
): ImmutableMarkdownCell =>
  ImmutableMap({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: createImmutableMetadata(cell.metadata)
  });

const createImmutableCodeCell = (cell: CodeCell): ImmutableCodeCell =>
  ImmutableMap({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    outputs: ImmutableList(cell.outputs.map(createImmutableOutput)),
    execution_count: cell.execution_count,
    metadata: createImmutableMetadata(cell.metadata)
  });

const createImmutableCell = (cell: Cell): ImmutableCell => {
  switch (cell.cell_type) {
    case "markdown":
      return createImmutableMarkdownCell(cell);
    case "code":
      return createImmutableCodeCell(cell);
    case "raw":
      return createImmutableRawCell(cell);
    default:
      throw new TypeError(`Cell type ${(cell as any).cell_type} unknown`);
  }
};

export const fromJS = (notebook: Notebook): ImmutableNotebook => {
  if (notebook.nbformat !== 4 || notebook.nbformat_minor < 0) {
    throw new TypeError(
      `Notebook is not a valid v4 notebook. v4 notebooks must be of form 4.x
       It lists nbformat v${notebook.nbformat}.${notebook.nbformat_minor}`
    );
  }

  // Since we're doing N cell operations all at once, switch to mutable then
  // switch back after.
  const starterCellStructure = {
    cellOrder: ImmutableList().asMutable(),
    cellMap: ImmutableMap().asMutable()
  };

  const cellStructure = notebook.cells.reduce(
    (cellStruct, cell) => appendCell(cellStruct, createImmutableCell(cell)),
    starterCellStructure as CellStructure
  );

  return ImmutableMap({
    cellOrder: cellStructure.cellOrder.asImmutable(),
    cellMap: cellStructure.cellMap.asImmutable(),
    nbformat_minor: notebook.nbformat_minor,
    nbformat: 4,
    metadata: immutableFromJS(notebook.metadata)
  });
};

interface PlainNotebook {
  cellOrder: ImmutableList<string>;
  cellMap: ImmutableMap<string, ImmutableCell>;
  metadata: ImmutableMap<string, any>;
  nbformat: 4;
  nbformat_minor: number;
}

const metadataToJS = (immMetadata: ImmutableMap<string, any>) =>
  immMetadata.toJS() as JSONObject;

const markdownCellToJS = (immCell: ImmutableCell): MarkdownCell => ({
  cell_type: "markdown",
  source: remultiline(immCell.get("source", "")),
  metadata: metadataToJS(immCell.get("metadata", ImmutableMap()))
});

const mimeBundleToJS = (immMimeBundle: ImmutableMimeBundle): MimeBundle => {
  const bundle = immMimeBundle.toObject();

  Object.keys(bundle).map(key => {
    if (isJSONKey(key)) {
      if (ImmutableMap.isMap(bundle[key])) {
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
};

const outputToJS = (immOutput: ImmutableOutput): Output => {
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
      // Note: this is one of the cases where the Array of strings (for
      // traceback) is part of the format, not a multiline string
      return immOutput.toJS() as any;
    default:
      throw new TypeError(`Output type ${output.output_type} not recognized`);
  }
};

interface IntermediateCodeCell {
  cell_type: "code";
  metadata: ImmutableMap<string, JSONType>;
  execution_count: ExecutionCount;
  source: string;
  outputs: ImmutableList<ImmutableOutput>;
}

const codeCellToJS = (immCell: ImmutableCell): CodeCell => {
  const cell = immCell.toObject() as IntermediateCodeCell;

  return {
    cell_type: "code",
    source: remultiline(cell.source),
    outputs: cell.outputs.map(outputToJS).toArray(),
    execution_count: cell.execution_count,
    metadata: metadataToJS(immCell.get("metadata", ImmutableMap()))
  };
};

const rawCellToJS = (immCell: ImmutableCell): RawCell => {
  const cell = immCell.toObject() as Cell;
  return {
    cell_type: "raw",
    source: remultiline(cell.source),
    metadata: metadataToJS(immCell.get("metadata", ImmutableMap()))
  };
};

const cellToJS = (immCell: ImmutableCell): Cell => {
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
};

export const toJS = (immnb: ImmutableNotebook): Notebook => {
  const plainNotebook = immnb.toObject() as PlainNotebook;
  const plainCellOrder: string[] = plainNotebook.cellOrder.toArray();
  const plainCellMap: {
    [key: string]: ImmutableCell;
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
};
