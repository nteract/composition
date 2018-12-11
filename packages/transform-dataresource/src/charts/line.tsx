/* @flow */
import * as React from "react";
import { curveMonotoneX } from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";

import TooltipContent from "../tooltip-content";
import { numeralFormatting } from "../utilities";

export const semioticLineChart = (
  data: Array<Object>,
  schema: Object,
  options: Object
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

  const { timeseriesSort } = chart;

  const sortType =
    timeseriesSort === "array-order"
      ? "integer"
      : schema.fields.find(field => field.name === timeseriesSort).type;

  const formatting =
    sortType === "datetime"
      ? tickValue => tickValue.toLocaleString().split(",")[0]
      : numeralFormatting;

  const xScale = sortType === "datetime" ? scaleTime() : scaleLinear();

  lineData = metrics
    .map((metric, index) => {
      const metricData =
        timeseriesSort === "array-order"
          ? data
          : data.sort(
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
    })
    .filter(
      metric =>
        selectedMetrics.length === 0 ||
        selectedMetrics.find(selectedMetric => selectedMetric === metric.label)
    );

  return {
    lineType: { type: lineType, interpolator: curveMonotoneX },
    lines: lineData,
    xScaleType: xScale,
    renderKey: (line: Object, index: number) => {
      return line.coordinates
        ? `line-${line.label}`
        : `linepoint=${line.label}-${index}`;
    },
    lineStyle: (line: Object) => ({
      fill: lineType === "line" ? "none" : line.color,
      stroke: line.color,
      fillOpacity: 0.75
    }),
    pointStyle: (point: Object) => {
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
        tickFormat: (tickValue: any) => {
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
          styleFn: (legendItem: Object) => ({ fill: legendItem.color }),
          items: lineData
        }
      ]
    },
    tooltipContent: (hoveredDatapoint: Object) => {
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
