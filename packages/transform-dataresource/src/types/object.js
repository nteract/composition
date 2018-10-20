import lodash from "lodash";
import { ERROR } from "./error";

// Module API

export function castObject(format, value) {
  if (!lodash.isObject(value)) {
    if (!lodash.isString(value)) {
      return ERROR;
    }
    try {
      value = JSON.parse(value);
    } catch (error) {
      return ERROR;
    }
    if (!lodash.isPlainObject(value)) {
      return ERROR;
    }
  }
  return value;
}
