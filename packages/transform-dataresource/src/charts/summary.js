/* @flow */
import * as React from "react";
import { scaleLinear } from "d3-scale";

import HTMLLegend from "../HTMLLegend";
import { numeralFormatting } from "../utilities";
import TooltipContent from "../tooltip-content";

const fontScale = scaleLinear()
  .domain([8, 25])
  .range([14, 8])
  .clamp(true);

export const semioticSummaryChart = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const additionalSettings = {};
  const colorHash = {};

  const { chart, summaryType, primaryKey, colors, setColor } = options;

  const { dim1, metric1 } = chart;

  const oAccessor = dim1;

  const rAccessor = metric1;

  if (dim1 && dim1 !== "none") {
    const uniqueValues = data.reduce(
      (uniqueArray, datapoint) =>
        (!uniqueArray.find(
          dimValue => dimValue === datapoint[dim1].toString()
        ) && [...uniqueArray, datapoint[dim1].toString()]) ||
        uniqueArray,
      []
    );

    uniqueValues.forEach((dimValue, index) => {
      colorHash[dimValue] = colors[index % colors.length];
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
  }

  const summarySettings = {
    summaryType: { type: summaryType, bins: 16, amplitude: 20 },
    type: summaryType === "violin" && "swarm",
    projection: "horizontal",
    data: data,
    oAccessor,
    rAccessor,
    summaryStyle: (summaryDatapoint: Object) => ({
      fill: colorHash[summaryDatapoint[dim1]] || colors[0],
      fillOpacity: 0.8,
      stroke: colorHash[summaryDatapoint[dim1]] || colors[0]
    }),
    style: (pieceDatapoint: Object) => ({
      fill: colorHash[pieceDatapoint[dim1]] || colors[0],
      stroke: "white"
    }),
    oPadding: 5,
    oLabel: (columnName: string) => (
      <text
        textAnchor="end"
        fontSize={`${(columnName && fontScale(columnName.length)) || 12}px`}
      >
        {columnName}
      </text>
    ),
    margin: { top: 25, right: 10, bottom: 50, left: 100 },
    axis: {
      orient: "left",
      label: rAccessor,
      tickFormat: numeralFormatting
    },
    baseMarkProps: { forceUpdate: true },
    pieceHoverAnnotation: summaryType === "violin",
    tooltipContent: (hoveredDatapoint: Object) => {
      return (
        <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
          <h3>{primaryKey.map(pkey => hoveredDatapoint[pkey]).join(", ")}</h3>
          <p>
            {dim1}: {hoveredDatapoint[dim1]}
          </p>
          <p>
            {rAccessor}: {hoveredDatapoint[rAccessor]}
          </p>
        </TooltipContent>
      );
    },
    ...additionalSettings
  };

  return summarySettings;
};
