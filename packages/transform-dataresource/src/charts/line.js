/* @flow */
import * as React from "react";
import { curveMonotone } from "d3-shape";
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
      : schema.fields.find(p => p.name === timeseriesSort).type;

  const formatting =
    sortType === "datetime"
      ? d => d.toLocaleString().split(",")[0]
      : numeralFormatting;

  const xScale = sortType === "datetime" ? scaleTime() : scaleLinear();

  lineData = metrics
    .map((d, i) => {
      const metricData =
        timeseriesSort === "array-order"
          ? data
          : data.sort((a, b) => a[timeseriesSort] - b[timeseriesSort]);
      return {
        color: colors[i % colors.length],
        label: d.name,
        type: d.type,
        coordinates: metricData.map((p, q) => ({
          value: p[d.name],
          x: timeseriesSort === "array-order" ? q : p[timeseriesSort],
          label: d.name,
          color: colors[i % colors.length],
          originalData: p
        }))
      };
    })
    .filter(
      d =>
        selectedMetrics.length === 0 || selectedMetrics.find(p => p === d.label)
    );

  return {
    lineType: { type: lineType, interpolator: curveMonotone },
    lines: lineData,
    xScaleType: xScale,
    renderKey: (d: Object, i: number) => {
      return d.coordinates ? `line-${d.label}` : `linepoint=${d.label}-${i}`;
    },
    lineStyle: (d: Object) => ({
      fill: lineType === "line" ? "none" : d.color,
      stroke: d.color,
      fillOpacity: 0.75
    }),
    pointStyle: (d: Object) => {
      return {
        fill: d.color,
        fillOpacity: 0.75
      };
    },
    axes: [
      { orient: "left", tickFormat: numeralFormatting },
      {
        orient: "bottom",
        ticks: 5,
        tickFormat: (d: any) => {
          const label = formatting(d);
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
          styleFn: (d: Object) => ({ fill: d.color }),
          items: lineData
        }
      ]
    },
    tooltipContent: (d: Object) => {
      return (
        <TooltipContent>
          <p>{d.parentLine && d.parentLine.label}</p>
          <p>{(d.value && d.value.toLocaleString()) || d.value}</p>
          <p>
            {timeseriesSort}: {formatting(d.x)}
          </p>
          {primaryKey.map((k, ki) => (
            <p key={`key-${ki}`}>
              {k}:{" "}
              {(d.originalData[k].toString && d.originalData[k].toString()) ||
                d.originalData[k]}
            </p>
          ))}
        </TooltipContent>
      );
    }
  };
};
