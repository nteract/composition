/* @flow */

import numeral from "numeral";

export function numeralFormatting(d: number): string {
  let format = "0.[00]a";
  if (d > 100000000000000 || d < 0.00001) {
    format = "0.[000]e+0";
  } else if (d < 1) {
    format = "0.[0000]a";
  }
  return numeral(d).format(format);
}

export function createLabelItems(uniqueValues: Array<string>): any[] {
  return uniqueValues.map(d => ({ label: d }));
}
