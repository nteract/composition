import tv4 from "tv4";
import lodash from "lodash";
import { ERROR } from "./error";
import profile from "../../profiles/geojson.json";

// Module API

export function castGeojson(format, value) {
  if (!lodash.isObject(value)) {
    if (!lodash.isString(value)) {
      return ERROR;
    }
    try {
      value = JSON.parse(value);
    } catch (error) {
      return ERROR;
    }
  }
  if (format === "default") {
    try {
      const valid = tv4.validate(value, profile);
      if (!valid) {
        return ERROR;
      }
    } catch (error) {
      return ERROR;
    }
  } else if (format === "topojson") {
    if (!lodash.isPlainObject(value)) {
      return ERROR;
    }
  }
  return value;
}
