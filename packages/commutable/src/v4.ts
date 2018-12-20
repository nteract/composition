/**
 * @module commutable
 */
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
 */

import {
  Map as ImmutableMap,
  fromJS as immutableFromJS,
  List as ImmutableList,
  Set as ImmutableSet
} from "immutable";

import {
  makeNotebookRecord,
  ImmutableNotebook,
  NotebookRecordParams
} from "./notebook";

import { JSONObject, MultiLineString, ExecutionCount } from "./primitives";

import {
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableCell,
  makeCodeCell,
  makeRawCell,
  makeMarkdownCell
} from "./cells";

import {
  createImmutableMimeBundle,
  ImmutableOutput,
  makeExecuteResult,
  makeDisplayData,
  makeStreamOutput,
  makeErrorOutput,
  demultiline,
  remultiline,
  isJSONKey,
  MimeBundle,
  ImmutableMimeBundle,
  Output,
  StreamOutput,
  createImmutableOutput
} from "./outputs";

import { appendCell, CellStructure } from "./structures";

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

export type Notebook = {
  cells: Array<Cell>;
  metadata: Object;
  nbformat: 4;
  nbformat_minor: number;
};

/**
 * Converts a mutable representation of metadata to an immutable representation.
 *
 * @param metadata A JSON representation of notebook metadata.
 *
 * @returns ImmutableMetadata An immutable representation of the metadata.
 */
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
  makeRawCell({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: createImmutableMetadata(cell.metadata)
  });

const createImmutableMarkdownCell = (
  cell: MarkdownCell
): ImmutableMarkdownCell =>
  makeMarkdownCell({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: createImmutableMetadata(cell.metadata)
  });

const createImmutableCodeCell = (cell: CodeCell): ImmutableCodeCell =>
  makeCodeCell({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    outputs: ImmutableList(cell.outputs.map(createImmutableOutput)),
    execution_count: cell.execution_count,
    metadata: createImmutableMetadata(cell.metadata)
  });

/**
 * Converts a JSON representation of a cell of any type to the correct
 * immutable representation, per the v4 nbformat specification.
 *
 * @param cell A JSON representation of a cell.
 *
 * @returns An immutable representation of the same cell.
 */
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

export const fromJS = (notebook: Notebook) => {
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

  return makeNotebookRecord({
    cellOrder: cellStructure.cellOrder.asImmutable(),
    cellMap: cellStructure.cellMap.asImmutable(),
    nbformat_minor: notebook.nbformat_minor,
    nbformat: 4,
    metadata: immutableFromJS(notebook.metadata)
  });
};

const metadataToJS = (immMetadata: ImmutableMap<string, any>) =>
  immMetadata.toJS() as JSONObject;

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

const outputToJS = (output: ImmutableOutput): Output => {
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
      return {
        output_type: output.output_type,
        ename: output.ename,
        evalue: output.evalue,
        // Note: this is one of the cases where the Array of strings (for
        // traceback) is part of the format, not a multiline string
        traceback: output.traceback.toJS()
      };
  }
};

const markdownCellToJS = (immCell: ImmutableMarkdownCell): MarkdownCell => ({
  cell_type: "markdown",
  source: remultiline(immCell.source),
  metadata: metadataToJS(immCell.metadata)
});

/**
 * Converts an immutable representation of a code cell to a JSON representation.
 *
 * @param immCell An immutable representation of a code cell.
 *
 * @returns A JSON representation of the same code cell.
 */
const codeCellToJS = (immCell: ImmutableCodeCell): CodeCell => {
  return {
    cell_type: "code",
    source: remultiline(immCell.source),
    outputs: immCell.outputs.map(outputToJS).toArray(),
    execution_count: immCell.execution_count,
    metadata: metadataToJS(immCell.metadata)
  };
};

/**
 * Converts an immutable representation of a raw cell to a JSON representation.
 *
 * @param immCell An immutable representation of a raw cell.
 *
 * @returns A JSON representation of the same raw cell.
 */
const rawCellToJS = (immCell: ImmutableRawCell): RawCell => {
  return {
    cell_type: "raw",
    source: remultiline(immCell.source),
    metadata: metadataToJS(immCell.get("metadata", ImmutableMap()))
  };
};

/**
 * Converts an immutable cell to a JSON cell.
 *
 * @param immCell An immutable representation of a cell.
 *
 * @returns A JSON representation of the same cell.
 */
const cellToJS = (immCell: ImmutableCell): Cell => {
  switch (immCell.cell_type) {
    case "markdown":
      return markdownCellToJS(immCell);
    case "code":
      return codeCellToJS(immCell);
    case "raw":
      return rawCellToJS(immCell);
    default:
      throw new TypeError(`Cell type unknown at runtime`);
  }
};

/**
 * Converts an immutable representation of a notebook to a JSON representation.
 *
 * @param immnb The immutable representation of a notebook.
 *
 * @returns The JSON representation of a notebook.
 */
export const toJS = (immnb: ImmutableNotebook): Notebook => {
  const plainNotebook = immnb.toObject() as NotebookRecordParams;
  const plainCellOrder: string[] = plainNotebook.cellOrder.toArray();
  const plainCellMap: {
    [key: string]: ImmutableCell;
  } = plainNotebook.cellMap.toObject();

  const cells = plainCellOrder.map((cellId: string) =>
    cellToJS(plainCellMap[cellId])
  );

  return {
    cells,
    metadata: plainNotebook.metadata.toJS(),
    nbformat: 4,
    nbformat_minor: plainNotebook.nbformat_minor
  };
};
