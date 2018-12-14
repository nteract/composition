/* @flow */
import * as React from "react";
import { curveMonotoneX } from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";

import TooltipContent from "../tooltip-content";
import { numeralFormatting } from "../utilities";
import * as Dx from "Dx";

interface LineOptions {
  chart: Dx.Chart;
  selectedMetrics: string[];
  lineType: Dx.LineType;
  metrics: Dx.Metric[];
  primaryKey: string[];
  colors: string[];
}

export const semioticLineChart = (
  data: Dx.Datapoint[],
  schema: Dx.Schema,
  options: LineOptions
) => {
  let lineData;

  const {
    chart,
    selectedMetrics,
    lineType,
    metrics,
    primaryKey,
    colors
  } = options;
  // const F = (a: number, b:Dx.Chart): string[]=> selectedMetrics;
  const { timeseriesSort } = chart;

  const timeSeriesFields = schema.fields.find(
    field => field && field.name === timeseriesSort
  );

  const sortType =
    timeseriesSort === "array-order"
      ? "integer"
      : timeSeriesFields && timeSeriesFields.type
      ? timeSeriesFields.type
      : null;

  const formatting = (tickValue: Date | number) =>
    sortType === "datetime"
      ? (tickValue as Date).toLocaleString().split(",")[0]
      : numeralFormatting(tickValue as number);

  const xScale = sortType === "datetime" ? scaleTime() : scaleLinear();
  lineData = metrics
    .map(
      (metric: Dx.Metric, index: number): Dx.LineData => {
        const metricData =
          timeseriesSort === "array-order"
            ? data
            : data.sort(
                // Using some questionable type assertions here
                (datapointA, datapointB) =>
                  datapointA[timeseriesSort] - datapointB[timeseriesSort]
              );
        return {
          color: colors[index % colors.length],
          label: metric.name,
          type: metric.type,
          coordinates: metricData.map((datapoint, datapointValue) => ({
            value: datapoint[metric.name],
            x:
              timeseriesSort === "array-order"
                ? datapointValue
                : datapoint[timeseriesSort],
            label: metric.name,
            color: colors[index % colors.length],
            originalData: datapoint
          }))
        };
      }
    )
    .filter(
      (metric: Dx.LineData) =>
        selectedMetrics.length === 0 ||
        selectedMetrics.some(selectedMetric => selectedMetric === metric.label)
    );

  return {
    lineType: { type: lineType, interpolator: curveMonotoneX },
    lines: lineData,
    xScaleType: xScale,
    renderKey: (
      line: { coordinates: Dx.LineCoordinate[]; label: string; line: string },
      index: number
    ) => {
      return line.coordinates
        ? `line-${line.label}`
        : `linepoint=${line.label}-${index}`;
    },
    lineStyle: (line: Dx.LineCoordinate) => ({
      fill: lineType === "line" ? "none" : line.color,
      stroke: line.color,
      fillOpacity: 0.75
    }),
    pointStyle: (point: Dx.LineData) => {
      return {
        fill: point.color,
        fillOpacity: 0.75
      };
    },
    axes: [
      { orient: "left", tickFormat: numeralFormatting },
      {
        orient: "bottom",
        ticks: 5,
        tickFormat: (tickValue: number) => {
          const label = formatting(tickValue);
          const rotation = label.length > 4 ? "45" : "0";
          const textAnchor = label.length > 4 ? "start" : "middle";
          return (
            <text transform={`rotate(${rotation})`} textAnchor={textAnchor}>
              {label}
            </text>
          );
        }
      }
    ],
    hoverAnnotation: true,
    xAccessor: "x",
    yAccessor: "value",
    showLinePoints: lineType === "line",
    margin: {
      top: 20,
      right: 200,
      bottom: sortType === "datetime" ? 80 : 40,
      left: 50
    },
    legend: {
      title: "Legend",
      position: "right",
      width: 200,
      legendGroups: [
        {
          label: "",
          styleFn: (legendItem: Dx.LineData) => ({ fill: legendItem.color }),
          items: lineData
        }
      ]
    },
    tooltipContent: (hoveredDatapoint: Dx.Datapoint) => {
      return (
        <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
          <p>
            {hoveredDatapoint.parentLine && hoveredDatapoint.parentLine.label}
          </p>
          <p>
            {(hoveredDatapoint.value &&
              hoveredDatapoint.value.toLocaleString()) ||
              hoveredDatapoint.value}
          </p>
          <p>
            {timeseriesSort}: {formatting(hoveredDatapoint.x)}
          </p>
          {primaryKey.map((pkey, index) => (
            <p key={`key-${index}`}>
              {pkey}:{" "}
              {(hoveredDatapoint.originalData[pkey].toString &&
                hoveredDatapoint.originalData[pkey].toString()) ||
                hoveredDatapoint.originalData[pkey]}
            </p>
          ))}
        </TooltipContent>
      );
    }
  };
};
