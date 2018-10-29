import { Map as ImmutableMap, List as ImmutableList } from "immutable";

// Mutable JSON types
export type PrimitiveImmutable = string | number | boolean | null;
export type JSONType = PrimitiveImmutable | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONType;
}
export interface JSONArray extends Array<JSONType> {}

// Immutable.js Wrapped JSON types
export type ImmutableJSONType =
  | PrimitiveImmutable
  | ImmutableJSONMap
  | ImmutableJSONList;
interface ImmutableJSONMap extends ImmutableMap<string, ImmutableJSONType> {}
interface ImmutableJSONList extends ImmutableList<ImmutableJSONType> {}

export type ExecutionCount = number | null;

export type MimeBundle = JSONObject;

export type CellType = "markdown" | "code";
export type CellID = string;

// These are very unserious types, since Records are not quite typable
export type ImmutableNotebook = ImmutableMap<string, any>;
export type ImmutableCodeCell = ImmutableMap<string, any>;
export type ImmutableMarkdownCell = ImmutableMap<string, any>;
export type ImmutableRawCell = ImmutableMap<string, any>;
export type ImmutableCell = ImmutableCodeCell | ImmutableMarkdownCell;
export type ImmutableOutput = ImmutableMap<string, any>;
export type ImmutableOutputs = ImmutableList<ImmutableOutput>;

export type ImmutableMimeBundle = ImmutableMap<string, any>;

export type ImmutableCellOrder = ImmutableList<CellID>;
export type ImmutableCellMap = ImmutableMap<CellID, ImmutableCell>;

// On disk multi-line strings are used to accomodate line-by-line diffs in tools
// like git and GitHub. They get converted to strings for the in-memory format.
export type MultiLineString = string | string[];
