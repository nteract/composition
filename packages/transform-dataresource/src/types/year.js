import lodash from "lodash";
import { ERROR } from "./error";

// Module API

export function castYear(format, value) {
  if (!lodash.isInteger(value)) {
    if (!lodash.isString(value)) {
      return ERROR;
    }
    if (value.length !== 4) {
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
  if (value < 0 || value > 9999) {
    return ERROR;
  }
  return value;
}
