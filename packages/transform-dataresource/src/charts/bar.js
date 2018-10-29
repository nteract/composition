/* @flow */
import * as React from "react";

import TooltipContent from "../tooltip-content";
import HTMLLegend from "../HTMLLegend";
import { numeralFormatting } from "../utilities";

import { sortByOrdinalRange } from "./shared";

export const semioticBarChart = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const { selectedDimensions, chart, colors, setColor } = options;
  const { dim1, metric1, metric3 } = chart;

  const oAccessor =
    selectedDimensions.length === 0
      ? dim1
      : (d: Object) => selectedDimensions.map(p => d[p]).join(",");

  const rAccessor = metric1;

  const additionalSettings = {};
  const colorHash = { Other: "grey" };

  const sortedData = sortByOrdinalRange(
    oAccessor,
    (metric3 !== "none" && metric3) || rAccessor,
    dim1,
    data
  );

  if (metric3 && metric3 !== "none") {
    additionalSettings.dynamicColumnWidth = metric3;
  }

  if (dim1 && dim1 !== "none") {
    const uniqueValues = sortedData.reduce(
      (p, c) =>
        (!p.find(d => d === c[dim1].toString()) && [
          ...p,
          c[dim1].toString()
        ]) ||
        p,
      []
    );

    uniqueValues.forEach((d: string, i: number) => {
      colorHash[d] = i > 18 ? "grey" : colors[i % colors.length];
    });

    additionalSettings.afterElements = (
      <HTMLLegend
        valueHash={{}}
        values={uniqueValues}
        colorHash={colorHash}
        setColor={setColor}
        colors={colors}
      />
    );

    if (
      selectedDimensions.length > 0 &&
      selectedDimensions.join(",") !== dim1
    ) {
      additionalSettings.pieceHoverAnnotation = true;
      additionalSettings.tooltipContent = d => {
        return (
          <TooltipContent x={d.x} y={d.y}>
            {dim1 && dim1 !== "none" && <p>{d[dim1]}</p>}
            <p>
              {typeof oAccessor === "function" ? oAccessor(d) : d[oAccessor]}
            </p>
            <p>
              {rAccessor}: {d[rAccessor]}
            </p>
            {metric3 &&
              metric3 !== "none" && (
                <p>
                  {metric3}: {d[metric3]}
                </p>
              )}
          </TooltipContent>
        );
      };
    }
  }

  //replace with incoming cardinality when df.describe metadata is implemented
  const cardinality =
    (selectedDimensions.length > 0 &&
      !(selectedDimensions.length === 1 && dim1 === selectedDimensions[0]) &&
      sortedData
        .map(d => d[dim1])
        .reduce((p, c) => (p.indexOf(c) === -1 ? [...p, c] : p), []).length) ||
    0;

  const barSettings = {
    type: cardinality > 4 ? "clusterbar" : "bar",
    data: sortedData,
    oAccessor,
    rAccessor,
    style: (d: Object) => ({
      fill: colorHash[d[dim1]] || colors[0],
      stroke: colorHash[d[dim1]] || colors[0]
    }),
    oPadding: 5,
    oLabel: (d: Object) => {
      return <text transform="rotate(90)">{d}</text>;
    },
    hoverAnnotation: true,
    margin: { top: 10, right: 10, bottom: 100, left: 70 },
    axis: {
      orient: "left",
      label: rAccessor,
      tickFormat: numeralFormatting
    },
    tooltipContent: (d: Object) => {
      return (
        <TooltipContent x={d.column.xyData[0].xy.x} y={d.column.xyData[0].xy.y}>
          <p>
            {typeof oAccessor === "function"
              ? oAccessor(d.pieces[0])
              : d.pieces[0][oAccessor]}
          </p>
          <p>
            {rAccessor}:{" "}
            {d.pieces.map(p => p[rAccessor]).reduce((p, c) => p + c, 0)}
          </p>
          {metric3 &&
            metric3 !== "none" && (
              <p>
                {metric3}:{" "}
                {d.pieces.map(p => p[metric3]).reduce((p, c) => p + c, 0)}
              </p>
            )}
        </TooltipContent>
      );
    },
    baseMarkProps: { forceUpdate: true },
    ...additionalSettings
  };

  return barSettings;
};
