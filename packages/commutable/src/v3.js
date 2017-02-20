/* @flow */

const Immutable = require('immutable');

import type {
  ImmutableNotebook,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableCell,
  ImmutableOutput,
  ImmutableMimeBundle,
} from './types';

import type {
    CellStructure,
} from './structures';

function demultiline(s: string | Array<string>) {
    if (Array.isArray(s)) {
          return s.join('');
        }
    return s;
}

type MultiLineString = string | Array<string>;

export type Notebook = {|
  worksheets: Array<Worksheet>,
  metadata: Object,
  nbformat: 3,
  nbformat_minor: number,
|};

export type Worksheet = {|
  cells: Array<Cell>,
  metadata: Object,
|};

export type ExecuteResult = {|
  output_type: 'pyout',
  prompt_number: number,
  output_metadata: Object,
  text: MultieLineString,
  latex: MultieLineString,
  png: MultieLineString,
  jpeg: MultieLineString,
  svg: MultieLineString,
  html: MultieLineString,
  javascript: MultieLineString,
  json: MultieLineString,
  pdf: MultieLineString,
|};

export type ExecuteResult = {|
  output_type: 'display_data',
  output_metadata: Object,
  text: MultieLineString,
  latex: MultieLineString,
  png: MultieLineString,
  jpeg: MultieLineString,
  svg: MultieLineString,
  html: MultieLineString,
  javascript: MultieLineString,
  json: MultieLineString,
  pdf: MultieLineString,
|};

export type StreamOutput = {|
  output_type: 'stream',
  stream: string,
  text: MultiLineString,
|};

export type ErrorOutput = {|
  output_type: 'pyerr',
  ename: string,
  evalue: string,
  traceback: Array<string>,
|};

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

export type RawCell = {|
  cell_type: 'raw',
  metadata: JSONObject,
  source: MultiLineString,
|};

export type MarkdownCell = {|
  cell_type: 'markdown',
  metadata: JSONObject,
  source: MultiLineString,
|};

export type HeadingCell = {|
  cell_type: 'heading',
  metadata: JSONObject,
  source: MultiLineString,
  level: number,
|};

export type CodeCell = {|
  cell_type: 'code',
  language: string,
  collapsed: boolean,
  metadata: JSONObject,
  input: MultiLineString,
  prompt_number: number,
  outputs: Output
|};

export type Cell = RawCell | MarkdownCell | HeadingCell | CodeCell;

export type Worksheet = {|
  cells: Array<Cell>,
  metadata: Object,
|};

export type Notebook = {|
  worksheets: Array<Worksheet>,
  metadata: Object,
  nbformat: 3,
  nbformat_minor: number,
|};

function createImmutableMarkdownCell(cell) {
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata),
  });
}

function cleanMimeAtKey(mimeBundle: MimeBundle, previous: ImmutableMimeBundle, key: string) {
  return previous.set(key, cleanMimeData(key, mimeBundle[key]));
}

function createImmutableMimeBundle(output: Output): ImmutableMimeBundle {
  const VALID_MIMETYPES = {
    "text": "text/plain",
    "latex": ,
    "png": "image/png",
    "jpeg": "image/jpeg",
    "svg": "image/svg+xml",
    "html": "text/html",
    "javascript": "application/x-javascript",
    "json": "application/javascript",
    "pdf": "application/pdf",
  };
  const mimeBundle = {};
  Object.keys(output).map(function(key) {
    if (key.indexOf(Object.keys(VALID_MIMETYPES)) >= 0) {
      mimeBundle[VALID_MIME_TYPES[key]] = output[key];
    }
  });
  return Object.keys(mimeBundle)
    .reduce(cleanMimeAtKey.bind(null, mimeBundle), Immutable.Map());
}

function sanitize(o: ExecuteResult | DisplayData) {
  if (o.metadata) {
    return { metadata: Immutable.fromJS(o.metadata) };
  }
  return {};
}

function createImmutableOutput(output: Output): ImmutableOutput {
  switch (output.output_type) {
    case 'pyout':
      return Immutable.Map(Object.assign({}, {
        output_type: output.output_type,
        execution_count: output.prompt_number,
        data: createImmutableMimeBundle(output),
      }, sanitize(output)));
    case 'display_data':
      return Immutable.Map(Object.assign({}, {
        output_type: output.output_type,
        data: createImmutableMimeBundle(output),
      }, sanitize(output)));
    case 'stream':
      return Immutable.Map({
        output_type: output.output_type,
        name: output.stream,
        text: demultiline(output.text),
      });
    case 'pyerr':
      return Immutable.Map({
        output_type: 'error',
        ename: output.ename,
        evalue: output.evalue,
        traceback: Immutable.List(output.traceback),
      });
    default:
      throw new TypeError(`Output type ${output.output_type} not recognized`);
  }
}

function createImmutableCodeCell(cell): ImmutableCodeCell {
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultline(cell.input),
    outputs: new Immutable.List(cell.outputs.map(createImmutableOutput)),
    execution_count: cell.prompt_number,
    metadata: Immutable.fromJS(cell.metadata),
  });
}

function createImmutableRawCell(cell: RawCell): ImmutableRawCell {
  return new Immutable.Map({
    cell_type: cell.cell_type,
    source: demultiline(cell.source),
    metadata: Immutable.fromJS(cell.metadata),
  });
}

function createImmutableHeadingCell(cell: HeadingCell): ImmutableMarkdownCell {
  return new Immutable.Map({
    cell_type: 'markdown',
    source: demultiline(cell.source.map((line) => {
      return Array(cell.level).join('#').concat(line);
    }));
    metadata: Immutable.fromJS(cell.metadata),
}

function createImmutableCell(cell) {
  switch (cell.cell_type) {
    case 'markdown':
      return createImmutableMarkdownCell(cell);
    case 'code':
      return createImmutableCodeCell(cell);
    case 'raw':
      return createImmutableRawCell(cell);
    case 'heading':
      return createImmutableHeadingCell(cell);
    default:
      throw new TypeError(`Cell type ${cell.cell_type} unknown`);
  }
}

function fromJS(notebook: Notebook): ImmutableNotebook {
  if (notebook.nbformat !== 3 || notebook.nbformat_minor < 0) {
    throw new TypeError(
      `Notebook is not a valid v3 notebook. v3 notebooks must be of form 3.x
      It lists nbformat v${notebook.nbformat}.${notebook.nbformat_minor}`
    );
  }

  const starterCellStructure = {
    cellOrder: Immutable.List().asMutable(),
    cellMap: Immutable.Map().asMutable(),
  }

  const cellStructure = [].concat.apply([], notebook.worksheets.map((cells) => {
    cells.reduce((cellStruct: CellStructure, cell: Cell) =>
      appendCell(cellStruct, createImmutableCell(cell)),
    starterCellStructure);
  }));

  return Immutable.Map({
    cellOrder: cellStructure.cellOrder.asImmutable(),
    cellMap: cellStructure.cellMap.asImmutable(),
    nbformat_minor: notebook.nbformat_minor,
    nbformat: 4,
    metadata: Immutable.fromJS(notebook.metadata),
  });
}

module.exports = {
  fromJS,
};
