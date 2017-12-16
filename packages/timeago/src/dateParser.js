// @flow

export default function dateParser(date: string | number | Date): Date {
  let parsed = new Date(date);
  if (!Number.isNaN(parsed.valueOf())) {
    return parsed;
  }

  let parts: ?$ReadOnlyArray<string> = String(date).match(/\d+/g);
  if (parts == null || parts.length <= 2) {
    return parsed;
  } else {
    const [firstP, secondP, ...restPs] = parts.map(x => parseInt(x));
    const correctedParts = [firstP, secondP - 1, ...restPs];
    let isoDate = new Date(Date.UTC(...correctedParts));
    return isoDate;
  }
}
