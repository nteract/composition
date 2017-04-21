// @flow

import type { Map as ImmutableMap, List as ImmutableList } from "immutable";

type PrimitiveImmutable = string | number | boolean | null;

export type JSONType = PrimitiveImmutable | JSONObject | JSONArray; // eslint-disable-line no-use-before-define
export type JSONObject = { [key: string]: JSONType };
export type JSONArray = Array<JSONType>;

export type ImmutableJSONType =
  | PrimitiveImmutable
  | ImmutableMap<string, ImmutableJSONType>
  | ImmutableList<ImmutableJSONType>;

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
