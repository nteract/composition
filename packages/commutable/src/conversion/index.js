// @flow

import * as Immutable from "immutable";

import { isPlainObject } from "lodash";

import * as records from "../records";

export function fromJS(json: JSONObject): records.NotebookRecord {
  if (!isPlainObject(json)) {
    throw new Error("notebook passed is not an object");
  }

  // NOTE: Only handling v4 here
  return records.makeNotebook({
    nbformat: json.nbformat,
    nbformatMinor: json.nbformatMinor,
    metadata: json.metadata,
    cells: Immutable.List()
  });
}
