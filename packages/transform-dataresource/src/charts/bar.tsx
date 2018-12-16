/* @flow */
import * as React from "react";

import TooltipContent from "../tooltip-content";
import HTMLLegend from "../HTMLLegend";
import { numeralFormatting } from "../utilities";

import { sortByOrdinalRange } from "./shared";
import * as Dx from "Dx";

interface SemioticOptions {
  selectedDimensions: Array<string>;
  chart: any;
  colors: any;
  setColor: any;
}

export const semioticBarChart = (
  data: Array<object>,
  schema: Dx.Schema,
  options: SemioticOptions
) => {
  const { selectedDimensions, chart, colors, setColor } = options;
  const { dim1, metric1, metric3 } = chart;

  const oAccessor =
    selectedDimensions.length === 0
      ? dim1
      : (datapoint: any) =>
          selectedDimensions
            .map(selectedDim => datapoint[selectedDim])
            .join(",");

  const rAccessor = metric1;

  interface AdditionalSettings {
    afterElements?: JSX.Element;
    dynamicColumnWidth?: string;
    tooltipContent?: (
      hoveredDataPoint: { x: number; y: number; [key: string]: any }
    ) => JSX.Element;
    pieceHoverAnnotation?: boolean;
  }

  const additionalSettings: AdditionalSettings = {};

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
      //Color the first 18 values after that everything gets grey because more than 18 colors is unreadable no matter what you want
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
      selectedDimensions.length > 0 &&
      selectedDimensions.join(",") !== dim1
    ) {
      additionalSettings.pieceHoverAnnotation = true;
      additionalSettings.tooltipContent = hoveredDatapoint => {
        return (
          <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
            {dim1 && dim1 !== "none" && <p>{hoveredDatapoint[dim1]}</p>}
            <p>
              {typeof oAccessor === "function"
                ? oAccessor(hoveredDatapoint)
                : hoveredDatapoint[oAccessor]}
            </p>
            <p>
              {rAccessor}: {hoveredDatapoint[rAccessor]}
            </p>
            {metric3 && metric3 !== "none" && (
              <p>
                {metric3}: {hoveredDatapoint[metric3]}
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
    type: cardinality > 4 ? "clusterbar" : "bar",
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
        : (columnLabel: Object) => {
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
    ...additionalSettings
  };

  return barSettings;
};
