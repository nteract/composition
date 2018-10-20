import lodash from "lodash";
import moment from "moment";
import { ERROR } from "./error";

// Module API

export function castDuration(format, value) {
  if (!moment.isDuration(value)) {
    if (!lodash.isString(value)) {
      return ERROR;
    }
    try {
      value = moment.duration(value);
      if (!value.as("milliseconds")) {
        return ERROR;
      }
    } catch (error) {
      return ERROR;
    }
  }
  return value;
}
