import * as React from "react";

import HTMLLegend from "../HTMLLegend";
import TooltipContent from "../tooltip-content";
import { numeralFormatting } from "../utilities";

import * as Dx from "../types";
import { sortByOrdinalRange } from "./shared";

interface BarOptions {
  selectedDimensions: string[];
  chart: Dx.Chart;
  colors: string[];
  setColor: (color: string[]) => void;
  barGrouping: Dx.BarGroupingType;
  dimensions: object[];
  metrics: object[];
}

export const semioticBarChart = (
  data: Dx.Datapoint[],
  schema: Dx.Schema,
  options: BarOptions
) => {
  const { selectedDimensions, chart, colors, setColor, barGrouping } = options;
  const { dim1, metric1, metric3, metric4 } = chart;

  const oAccessor =
    selectedDimensions.length === 0
      ? dim1
      : (datapoint: Dx.Datapoint) =>
          selectedDimensions
            .map(selectedDim => datapoint[selectedDim])
            .join(",");

  const rAccessor = metric1;

  const additionalSettings: {
    afterElements?: JSX.Element;
    dynamicColumnWidth?: string;
    rExtent?: number[];
    tooltipContent?: (hoveredDataPoint: {
      x: number;
      y: number;
      [key: string]: any;
    }) => JSX.Element;
    pieceHoverAnnotation?: boolean;
  } = {};

  const colorHash: { [key: string]: string; Other: "grey" } = { Other: "grey" };

  const sortedData = sortByOrdinalRange(
    oAccessor,
    (metric3 !== "none" && metric3) || rAccessor,
    dim1,
    data
  );

  if (metric3 && metric3 !== "none") {
    additionalSettings.dynamicColumnWidth = metric3;
  }
  let errorBarAnnotations;
  if (barGrouping === "Clustered" && metric4 && metric4 !== "none") {
    additionalSettings.rExtent = [
      Math.min(...data.map(d => d[metric1] - d[metric4])),
      Math.max(...data.map(d => d[metric1] + d[metric4]))
    ];

    errorBarAnnotations = (
      d: Dx.Datapoint,
      i: number,
      xy: {
        width: number;
        height: number;
        styleFn: (args: object) => object;
        rScale: (args: object) => number;
      }
    ) => {
      const errorBarSize = Math.abs(
        xy.rScale(d[metric1]) - xy.rScale(d[metric1] + d[metric4])
      );

      return (
        <g>
          <rect width={xy.width} height={xy.height} style={xy.styleFn(d)} />
          <g
            transform={`translate(${xy.width / 2},${
              d.negative ? xy.height : 0
            })`}
            stroke="#333"
            strokeWidth="1"
            opacity="0.75"
          >
            <line
              y1={-errorBarSize}
              y2={-errorBarSize}
              x1={Math.min(0, -xy.width / 2 + 2)}
              x2={Math.max(0, xy.width / 2 - 2)}
            />
            <line x1={0} x2={0} y1={-errorBarSize} y2={errorBarSize} />
            <line
              y1={errorBarSize}
              y2={errorBarSize}
              x1={Math.min(0, -xy.width / 2 + 2)}
              x2={Math.max(0, xy.width / 2 - 2)}
            />
          </g>
        </g>
      );
    };
  }

  const uniqueValues = sortedData.reduce(
    (uniques, datapoint) =>
      !uniques.find(
        (uniqueDimName: string) => uniqueDimName === datapoint[dim1].toString()
      )
        ? [...uniques, datapoint[dim1].toString()]
        : uniques,
    []
  );

  if (dim1 && dim1 !== "none") {
    uniqueValues.forEach((value: string, index: number) => {
      // Color the first 18 values after that everything gets grey because more than 18 colors is unreadable no matter what you want
      colorHash[value] = index > 18 ? "grey" : colors[index % colors.length];
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
      barGrouping === "Clustered" ||
      (selectedDimensions.length > 0 && selectedDimensions.join(",") !== dim1)
    ) {
      additionalSettings.pieceHoverAnnotation = true;
      const combinedOptions = [
        ...options.dimensions,
        ...options.metrics
      ] as Array<{ name: string }>;
      additionalSettings.tooltipContent = hoveredDatapoint => {
        return (
          <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
            <div
              style={{ maxHeight: "300px", display: "flex", flexWrap: "wrap" }}
            >
              {combinedOptions.map((dim: { name: string }, index: number) => (
                <div
                  style={{
                    margin: "2px 5px 0",
                    display: "inline-block",
                    minWidth: "100px"
                  }}
                  key={`dim-${index}`}
                >
                  <span style={{ fontWeight: 600 }}>{dim.name}</span>:{" "}
                  {hoveredDatapoint[dim.name]}
                </div>
              ))}
            </div>
          </TooltipContent>
        );
      };
    }
  }

  // replace with incoming cardinality when df.describe metadata is implemented
  const cardinality =
    (selectedDimensions.length > 0 &&
      !(selectedDimensions.length === 1 && dim1 === selectedDimensions[0]) &&
      sortedData
        .map(datapoint => datapoint[dim1])
        .reduce(
          (uniqueDimValues, dimName) =>
            uniqueDimValues.indexOf(dimName) === -1
              ? [...uniqueDimValues, dimName]
              : uniqueDimValues,
          []
        ).length) ||
    0;

  const barSettings = {
    type:
      barGrouping === "Clustered"
        ? { type: "clusterbar", customMark: errorBarAnnotations }
        : { type: "bar", customMark: errorBarAnnotations },
    data: sortedData,
    oAccessor,
    rAccessor,
    style: (datapoint: Dx.Datapoint) => ({
      fill: colorHash[datapoint[dim1]] || colors[0],
      stroke: colorHash[datapoint[dim1]] || colors[0]
    }),
    oPadding: uniqueValues.length > 30 ? 1 : 5,
    oLabel:
      uniqueValues.length > 30
        ? false
        : (columnLabel: object) => {
            return <text transform="rotate(90)">{columnLabel}</text>;
          },
    hoverAnnotation: true,
    margin: { top: 10, right: 10, bottom: 100, left: 70 },
    axis: {
      orient: "left",
      label: rAccessor,
      tickFormat: numeralFormatting
    },
    tooltipContent: (hoveredDatapoint: { [key: string]: any }) => {
      return (
        <TooltipContent
          x={hoveredDatapoint.column.xyData[0].xy.x}
          y={hoveredDatapoint.column.xyData[0].xy.y}
        >
          <p>
            {typeof oAccessor === "function"
              ? oAccessor(hoveredDatapoint.pieces[0])
              : hoveredDatapoint.pieces[0][oAccessor]}
          </p>
          <p>
            {rAccessor}:{" "}
            {hoveredDatapoint.pieces
              .map((piece: { [key: string]: number }) => piece[rAccessor])
              .reduce((total: number, value: number) => total + value, 0)}
          </p>
          {metric3 && metric3 !== "none" && (
            <p>
              {metric3}:{" "}
              {hoveredDatapoint.pieces
                .map((piece: { [key: string]: number }) => piece[metric3])
                .reduce((total: number, value: number) => total + value, 0)}
            </p>
          )}
        </TooltipContent>
      );
    },
    baseMarkProps: { forceUpdate: true },
    size: [500, 600],
    ...additionalSettings
  };

  return barSettings;
};
