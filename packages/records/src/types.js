// @flow

export type PrimitiveImmutable = string | number | boolean | null;
export type JSONType = PrimitiveImmutable | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONType };
export type JSONArray = Array<JSONType>;

export type ExecutionCount = number | null;

export type MimeBundle = JSONObject;

export type CellType = "markdown" | "code";
export type CellID = string;

// These are very unserious types, since Records are not quite typable
export type ImmutableNotebook = Object;
export type ImmutableCodeCell = Object;
export type ImmutableMarkdownCell = Object;
export type ImmutableRawCell = Object;
export type ImmutableCell = ImmutableCodeCell | ImmutableMarkdownCell;
export type ImmutableOutput = Object;
export type ImmutableOutputs = Array<ImmutableOutput>;

export type ImmutableMimeBundle = Object;

export type ImmutableCellOrder = Array<CellID>;
export type ImmutableCellMap = Object;
