/* @flow */
import * as React from "react";
import HTMLLegend from "../HTMLLegend";
import { numeralFormatting } from "../utilities";
import { scaleLinear } from "d3-scale";

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
      (p, c) =>
        (!p.find(d => d === c[dim1].toString()) && [
          ...p,
          c[dim1].toString()
        ]) ||
        p,
      []
    );

    uniqueValues.forEach((d, i) => {
      colorHash[d] = colors[i % colors.length];
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
    summaryStyle: (d: Object) => ({
      fill: colorHash[d[dim1]] || colors[0],
      fillOpacity: 0.8,
      stroke: colorHash[d[dim1]] || colors[0]
    }),
    style: (d: Object) => ({
      fill: colorHash[d[dim1]] || colors[0],
      stroke: "white"
    }),
    oPadding: 5,
    oLabel: (d: Object) => (
      <text textAnchor="end" fontSize={`${(d && fontScale(d.length)) || 12}px`}>
        {d}
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
    tooltipContent: (d: Object) => (
      <TooltipContent>
        <h3>{primaryKey.map(p => d[p]).join(", ")}</h3>
        <p>
          {dim1}: {d[dim1]}
        </p>
        <p>
          {rAccessor}: {d[rAccessor]}
        </p>
      </TooltipContent>
    ),
    ...additionalSettings
  };

  return summarySettings;
};
