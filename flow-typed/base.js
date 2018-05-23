// @flow

declare type PrimitiveImmutable = string | number | boolean | null;
declare type JSONType = PrimitiveImmutable | JSONObject | JSONArray; // eslint-disable-line no-use-before-define
declare type JSONObject = { [key: string]: JSONType };
declare type JSONArray = Array<JSONType>;

import * as Immutable from "immutable";

/*

This is the definition of JSON that Flow provides

type JSON = | string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key:string]: JSON };
type JSONArray = Array<JSON>;

Which we'll adapt for our use of Immutable.js

*/
type ImmutableJSON =
  | string
  | number
  | boolean
  | null
  | ImmutableJSONMap
  | ImmutableJSONList; // eslint-disable-line no-use-before-define

type ImmutableJSONMap = Immutable.Map<string, ImmutableJSON>;

type ImmutableJSONList = Immutable.List<ImmutableJSON>;
