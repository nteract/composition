/* @flow */

function stringOrFnAccessor(d: Object, accessor: string | Function) {
  return typeof accessor === "function" ? accessor(d) : d[accessor];
}

export const sortByOrdinalRange = (
  oAccessor: Function | string,
  rAccessor: Function | string,
  secondarySort: string,
  data: Array<Object>
): any[] => {
  const subsortData = {};
  let subsortArrays = [];
  data.forEach(d => {
    const oD = stringOrFnAccessor(d, oAccessor);
    if (!subsortData[oD]) {
      subsortData[oD] = { array: [], value: 0, label: oD };
      subsortArrays.push(subsortData[oD]);
    }
    subsortData[oD].array.push(d);
    subsortData[oD].value += stringOrFnAccessor(d, rAccessor);
  });

  subsortArrays = subsortArrays.sort((a, b) => {
    if (b.value === a.value) {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 1;
    }

    return b.value - a.value;
  });

  if (secondarySort !== "none") {
    subsortArrays.forEach(a => {
      a.array = a.array.sort(
        (a, b) =>
          stringOrFnAccessor(b, secondarySort) -
          stringOrFnAccessor(a, secondarySort)
      );
    });
  }

  return subsortArrays.reduce((p, c) => [...p, ...c.array], []);
};
