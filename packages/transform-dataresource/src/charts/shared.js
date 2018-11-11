/* @flow */

function stringOrFnAccessor(datapoint: Object, accessor: string | Function) {
  return typeof accessor === "function"
    ? accessor(datapoint)
    : datapoint[accessor];
}

export const sortByOrdinalRange = (
  oAccessor: Function | string,
  rAccessor: Function | string,
  secondarySort: string,
  data: Array<Object>
): any[] => {
  const subsortData = {};
  let subsortArrays = [];
  data.forEach(datapoint => {
    const ordinalValue = stringOrFnAccessor(datapoint, oAccessor);
    if (!subsortData[ordinalValue]) {
      subsortData[ordinalValue] = { array: [], value: 0, label: ordinalValue };
      subsortArrays.push(subsortData[ordinalValue]);
    }
    subsortData[ordinalValue].array.push(datapoint);
    subsortData[ordinalValue].value += stringOrFnAccessor(datapoint, rAccessor);
  });

  subsortArrays = subsortArrays.sort((ordinalAData, ordinalBData) => {
    if (ordinalBData.value === ordinalAData.value) {
      if (ordinalAData.label < ordinalBData.label) return -1;
      if (ordinalAData.label > ordinalBData.label) return 1;
      return 1;
    }

    return ordinalBData.value - ordinalAData.value;
  });

  if (secondarySort !== "none") {
    subsortArrays.forEach(ordinalData => {
      ordinalData.array = ordinalData.array.sort(
        (ordinalAData, ordinalBData) =>
          stringOrFnAccessor(ordinalBData, secondarySort) -
          stringOrFnAccessor(ordinalAData, secondarySort)
      );
    });
  }

  return subsortArrays.reduce(
    (combinedArray, ordinalData) => [...combinedArray, ...ordinalData.array],
    []
  );
};
