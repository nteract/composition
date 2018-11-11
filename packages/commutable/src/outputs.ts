import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record,
  RecordOf
} from "immutable";

import { ExecutionCount } from "./primitives";

export type ImmutableMimeBundle = ImmutableMap<string, any>;

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
export const cleanMimeAtKey = (
  mimeBundle: MimeBundle,
  previous: ImmutableMimeBundle,
  key: string
): ImmutableMimeBundle =>
  previous.set(key, cleanMimeData(key, mimeBundle[key]));

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

export const createImmutableMimeBundle = (
  mimeBundle: MimeBundle
): ImmutableMimeBundle =>
  Object.keys(mimeBundle).reduce(
    cleanMimeAtKey.bind(null, mimeBundle),
    ImmutableMap()
  );

export const demultiline = (s: string | string[]): string =>
  Array.isArray(s) ? s.join("") : s;

/**
 * Split string into a list of strings delimited by newlines
 */
export const remultiline = (s: string | string[]): string[] =>
  Array.isArray(s) ? s : s.split(/(.+?(?:\r\n|\n))/g).filter(x => x !== "");

export const isJSONKey = (key: string) =>
  /^application\/(.*\+)?json$/.test(key);

/** ExecuteResult Record Boilerplate */
type ExecuteResultParams = {
  output_type: "execute_result";
  execution_count: ExecutionCount;
  data: ImmutableMimeBundle;
  metadata?: any;
};

export const makeExecuteResult = Record<ExecuteResultParams>({
  output_type: "execute_result",
  execution_count: null,
  data: ImmutableMap(),
  metadata: ImmutableMap()
});

type ImmutableExecuteResult = RecordOf<ExecuteResultParams>;

/** DisplayData Record Boilerplate */

type DisplayDataParams = {
  output_type: "display_data";
  data: ImmutableMimeBundle;
  metadata?: any;
};

export const makeDisplayData = Record<DisplayDataParams>({
  output_type: "display_data",
  data: ImmutableMap(),
  metadata: ImmutableMap()
});

type ImmutableDisplayData = RecordOf<DisplayDataParams>;

/** StreamOutput Record Boilerplate */

type StreamOutputParams = {
  output_type: "stream";
  name: "stdout" | "stderr";
  text: string;
};

export const makeStreamOutput = Record<StreamOutputParams>({
  output_type: "stream",
  name: "stdout",
  text: ""
});

type ImmutableStreamOutput = RecordOf<StreamOutputParams>;

/** ErrorOutput Record Boilerplate */

type ErrorOutputParams = {
  output_type: "error";
  ename: string;
  evalue: string;
  traceback: ImmutableList<string>;
};

export const makeErrorOutput = Record<ErrorOutputParams>({
  output_type: "error",
  ename: "",
  evalue: "",
  traceback: ImmutableList()
});

type ImmutableErrorOutput = RecordOf<ErrorOutputParams>;

//////////////

export type ImmutableOutput =
  | ImmutableExecuteResult
  | ImmutableDisplayData
  | ImmutableStreamOutput
  | ImmutableErrorOutput;

//////// OUTPUTS /////
