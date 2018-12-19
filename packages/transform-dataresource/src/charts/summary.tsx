import * as React from "react";
import { scaleLinear } from "d3-scale";

import HTMLLegend from "../HTMLLegend";
import { numeralFormatting } from "../utilities";
import TooltipContent from "../tooltip-content";
import * as Dx from "Dx";

const fontScale = scaleLinear()
  .domain([8, 25])
  .range([14, 8])
  .clamp(true);

export const semioticSummaryChart = (
  data: Dx.DataProps["data"],
  schema: Dx.DataProps["schema"],
  options: Dx.DataProps["options"]
) => {
  const additionalSettings: { afterElements?: JSX.Element } = {};
  const colorHash: { [index: string]: string } = {};

  const { chart, summaryType, primaryKey, colors, setColor } = options;

  const { dim1, metric1 } = chart;

  const oAccessor = dim1;

  const rAccessor = metric1;

  const uniqueValues = data.reduce(
    (uniqueArray: string[], datapoint) =>
      (!uniqueArray.find(
        (dimValue: string) => dimValue === datapoint[dim1].toString()
      ) && [...uniqueArray, datapoint[dim1].toString()]) ||
      uniqueArray,
    []
  );

  if (dim1 && dim1 !== "none") {
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
    summaryStyle: (summaryDatapoint: Dx.Datapoint) => ({
      fill: colorHash[summaryDatapoint[dim1]] || colors[0],
      fillOpacity: 0.8,
      stroke: colorHash[summaryDatapoint[dim1]] || colors[0]
    }),
    style: (pieceDatapoint: Dx.Datapoint) => ({
      fill: colorHash[pieceDatapoint[dim1]] || colors[0],
      stroke: "white"
    }),
    oPadding: 5,
    oLabel:
      uniqueValues.length > 30
        ? false
        : (columnName: string) => (
            <text
              textAnchor="end"
              fontSize={`${(columnName && fontScale(columnName.length)) ||
                12}px`}
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
    tooltipContent: (hoveredDatapoint: Dx.Datapoint) => {
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
