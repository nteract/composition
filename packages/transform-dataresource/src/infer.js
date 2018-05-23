import lodash from "lodash";
import * as types from "./types";

import { ERROR } from "./types/error";

/**
 * Infer Table Schema descriptor
 * https://github.com/frictionlessdata/tableschema-js#infer
 */
export function infer(headers, values, options = {}) {
  // Set up default options
  const opts = lodash.extend(
      {
        rowLimit: null,
        explicit: false,
        primaryKey: null,
        cast: {}
      },
      options
    ),
    descriptor = { fields: [] };

  if (opts.primaryKey) {
    if (lodash.isString(opts.primaryKey)) {
      opts.primaryKey = [opts.primaryKey];
    }
    descriptor.primaryKey = opts.primaryKey;
  }

  descriptor.fields = headers.map(header => {
    const constraints = {},
      field = {
        name: header,
        title: "",
        description: ""
      };

    if (opts.explicit) {
      constraints.required = true;
    }

    if (lodash.includes(opts.primaryKey, header)) {
      constraints.unique = true;
    }

    if (!lodash.isEmpty(constraints)) {
      field.constraints = constraints;
    }

    return field;
  });

  headers.forEach((header, index) => {
    let columnValues = lodash.map(values, value => value[index]);
    const field = descriptor.fields[index];

    if (opts.rowLimit) {
      columnValues = lodash.take(columnValues, opts.rowLimit);
    }

    field.type = _guessType(columnValues);

    if (opts.cast && opts.cast.hasOwnProperty.call(opts.cast, field.type)) {
      field.format = opts.cast[field.type].format;
    }

    if (!field.format) {
      field.format = "default";
    }
  });

  return descriptor;
}

// Internal

const _TYPE_ORDER = [
  "duration",
  "geojson",
  "geopoint",
  "object",
  "array",
  "datetime",
  "time",
  "date",
  "integer",
  "number",
  "boolean",
  "string",
  "any"
];

function _guessType(values) {
  // Get matching types
  const matches = [];
  for (const value of values) {
    for (const type of _TYPE_ORDER) {
      const cast = types[`cast${lodash.upperFirst(type)}`];
      const result = cast("default", value);
      if (result !== ERROR) {
        matches.push(type);
        break;
      }
    }
  }

  // Get winner type
  let winner = "any";
  let count = 0;
  for (const [itemType, itemCount] of lodash.toPairs(lodash.countBy(matches))) {
    if (itemCount > count) {
      winner = itemType;
      count = itemCount;
    }
  }

  return winner;
}
