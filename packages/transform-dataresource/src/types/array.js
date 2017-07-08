import lodash from "lodash";
import { ERROR } from "../config";

// Module API

export function castArray(format, value) {
  if (!lodash.isArray(value)) {
    if (!lodash.isString(value)) {
      return ERROR;
    }
    try {
      value = JSON.parse(value);
    } catch (error) {
      return ERROR;
    }
    if (!lodash.isArray(value)) {
      return ERROR;
    }
  }
  return value;
}
