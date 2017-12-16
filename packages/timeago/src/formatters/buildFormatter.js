// @flow

import type { Formatter, Unit, Suffix } from "../index";

type StringOrFn = string | ((value: number, millisDelta: number) => string);
type NumberArray = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

export type L10nsStrings = {
  prefixAgo?: ?StringOrFn,
  prefixFromNow?: ?StringOrFn,
  suffixAgo?: ?StringOrFn,
  suffixFromNow?: ?StringOrFn,
  second?: ?StringOrFn,
  seconds?: ?StringOrFn,
  minute?: ?StringOrFn,
  minutes?: ?StringOrFn,
  hour?: ?StringOrFn,
  hours?: ?StringOrFn,
  day?: ?StringOrFn,
  days?: ?StringOrFn,
  week?: ?StringOrFn,
  weeks?: ?StringOrFn,
  month?: ?StringOrFn,
  months?: ?StringOrFn,
  year?: ?StringOrFn,
  years?: ?StringOrFn,
  wordSeparator?: ?string,
  numbers?: NumberArray
};

// If the numbers array is present, format numbers with it,
// otherwise just cast the number to a string and return it
const normalizeNumber = (numbers: ?NumberArray, value: number) =>
  numbers && numbers.length === 10
    ? String(value)
        .split("")
        .map(
          (digit: string) =>
            digit.match(/^[0-9]$/)
              ? ((numbers: any): NumberArray)[parseInt(digit)]
              : digit
        )
        .join("")
    : String(value);

// Take a string or a function that takes number of days and returns a string
// and provide a uniform API to create string parts
const normalizeFn = (
  value: number,
  millisDelta: number,
  numbers: ?NumberArray
) => (stringOrFn: StringOrFn) =>
  typeof stringOrFn === "function"
    ? stringOrFn(value, millisDelta).replace(
        /%d/g,
        normalizeNumber(numbers, value)
      )
    : stringOrFn.replace(/%d/g, normalizeNumber(numbers, value));

export default function buildFormatter(strings: L10nsStrings): Formatter {
  return function formatter(
    value: number,
    unit: Unit,
    suffix: Suffix,
    epochMillis: number
  ) {
    // convert weeks to days if strings don't handle weeks
    const now = Date.now();
    if (unit === "week" && !strings.week && !strings.weeks) {
      const days = Math.round(
        Math.abs(epochMillis - now) / (1000 * 60 * 60 * 24)
      );
      value = days;
      unit = "day";
    }

    // create a normalize function for given value
    const normalize = normalizeFn(value, now - epochMillis, strings.numbers);

    // The eventual return value stored in an array so that the wordSeparator can be used
    let dateString: Array<string> = [];

    // handle prefixes
    if (suffix === "ago" && strings.prefixAgo) {
      dateString.push(normalize(strings.prefixAgo));
    }
    if (suffix === "from now" && strings.prefixFromNow) {
      dateString.push(normalize(strings.prefixFromNow));
    }

    // Handle Main number and unit
    const isPlural = value > 1;
    if (isPlural) {
      const stringFn: StringOrFn =
        strings[unit + "s"] || strings[unit] || "%d " + unit;
      dateString.push(normalize(stringFn));
    } else {
      const stringFn: StringOrFn =
        strings[unit] || strings[unit + "s"] || "%d " + unit;
      dateString.push(normalize(stringFn));
    }

    // Handle Suffixes
    if (suffix === "ago" && strings.suffixAgo) {
      dateString.push(normalize(strings.suffixAgo));
    }
    if (suffix === "from now" && strings.suffixFromNow) {
      dateString.push(normalize(strings.suffixFromNow));
    }

    // join the array into a string and return it
    const wordSeparator =
      typeof strings.wordSeparator === "string" ? strings.wordSeparator : " ";
    return dateString.join(wordSeparator);
  };
}
