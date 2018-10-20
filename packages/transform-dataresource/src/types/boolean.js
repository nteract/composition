import lodash from "lodash";
import { ERROR } from "./error";

// Module API

export function castBoolean(format, value) {
  if (!lodash.isBoolean(value)) {
    if (!lodash.isString(value)) {
      return ERROR;
    }
    value = value.trim().toLowerCase();
    if (_TRUE_VALUES.includes(value)) {
      value = true;
    } else if (_FALSE_VALUES.includes(value)) {
      value = false;
    } else {
      return ERROR;
    }
  }
  return value;
}

// Internal

const _TRUE_VALUES = ["yes", "y", "true", "t", "1"];
const _FALSE_VALUES = ["no", "n", "false", "f", "0"];
