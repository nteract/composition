import lodash from "lodash";
import { ERROR } from "./error";

// Module API

export function castNumber(format, value, options = {}) {
  let percentage = false;
  const currency = options.currency || false;
  const decimalChar = options.decimalChar || _DEFAULT_DECIMAL_CHAR;
  const groupChar = options.groupChar || _DEFAULT_GROUP_CHAR;
  if (!lodash.isNumber(value)) {
    if (!lodash.isString(value)) {
      return ERROR;
    }
    if (!value.length) {
      return ERROR;
    }
    value = value.replace(new RegExp("\\s", "g"), "");
    value = value.replace(new RegExp(`[${decimalChar}]`, "g"), ".");
    value = value.replace(new RegExp(`[${groupChar}]`, "g"), "");
    if (currency) {
      value = value.replace(new RegExp(`[${_CURRENCY_CHAR}]`, "g"), "");
    }
    const result = value.replace(new RegExp(`[${_PERCENT_CHAR}]`, "g"), "");
    if (value !== result) {
      percentage = true;
      value = result;
    }
    try {
      value = lodash.toNumber(value);
    } catch (error) {
      return ERROR;
    }
  }
  if (lodash.isNaN(value)) {
    return ERROR;
  }
  if (percentage) {
    value = value / 100;
  }
  return value;
}

// Internal

const _DEFAULT_DECIMAL_CHAR = ".";
const _DEFAULT_GROUP_CHAR = "";
const _PERCENT_CHAR = "%‰‱％﹪٪";
const _CURRENCY_CHAR = "$£€";
