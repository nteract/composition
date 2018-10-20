// @flow

export default function defaultFormatter(
  value: number,
  unit: string,
  suffix: string
): string {
  if (value !== 1) {
    unit += "s";
  }
  return value + " " + unit + " " + suffix;
}
