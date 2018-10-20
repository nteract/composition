import lodash from "lodash";
import { ERROR } from "./error";

// Module API

export function castInteger(format, value) {
  if (!lodash.isInteger(value)) {
    if (!lodash.isString(value)) {
      return ERROR;
    }
    try {
      const result = parseInt(value, 10);
      if (lodash.isNaN(result) || result.toString() !== value) {
        return ERROR;
      }
      value = result;
    } catch (error) {
      return ERROR;
    }
  }
  return value;
}
