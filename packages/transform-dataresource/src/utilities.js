/* @flow */

import numeral from "numeral";

export function numeralFormatting(tickValue: number): string {
  let format = "0.[00]a";
  if (tickValue === 0) {
    return "0";
  } else if (tickValue > 100000000000000 || tickValue < 0.00001) {
    format = "0.[000]e+0";
  } else if (tickValue < 1) {
    format = "0.[0000]a";
  }
  return numeral(tickValue).format(format);
}

export function createLabelItems(uniqueValues: Array<string>): any[] {
  return uniqueValues.map(value => ({ label: value }));
}
