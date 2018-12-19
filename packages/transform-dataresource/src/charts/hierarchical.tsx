/* @flow */
import * as React from "react";
import { nest } from "d3-collection";
import { interpolateLab } from "d3-interpolate";

import TooltipContent from "../tooltip-content";

import * as Dx from "Dx";
import { JSONObject } from "@nteract/commutable";

const parentPath = (datapoint: Dx.Datapoint, pathArray: string[]) => {
  if (datapoint.parent) {
    pathArray = parentPath(datapoint.parent, [datapoint.key, ...pathArray]);
  } else {
    pathArray = ["root", ...pathArray];
  }
  return pathArray;
};

const hierarchicalTooltip = (
  datapoint: Dx.Datapoint,
  primaryKey: string[],
  metric: string
) => {
  const pathString = datapoint.parent
    ? parentPath(
        datapoint.parent,
        (datapoint.key && [datapoint.key]) || []
      ).join("->")
    : "";
  const content = [];
  if (!datapoint.parent) {
    content.push(<h2 key="hierarchy-title">Root</h2>);
  } else if (datapoint.key) {
    content.push(<h2 key="hierarchy-title">{datapoint.key}</h2>);
    content.push(<p key="path-string">{pathString}</p>);
    content.push(<p key="hierarchy-value">Total Value: {datapoint.value}</p>);
    content.push(
      <p key="hierarchy-children">Children: {datapoint.children.length}</p>
    );
  } else {
    content.push(
      <p key="leaf-label">
        {pathString}
        ->
        {primaryKey.map((pkey: string) => datapoint[pkey]).join(", ")}
      </p>
    );
    content.push(
      <p key="hierarchy-value">
        {metric}: {datapoint[metric]}
      </p>
    );
  }

  return content;
};

const hierarchicalColor = (
  colorHash: { [index: string]: string },
  datapoint: Dx.Datapoint
) => {
  if (datapoint.depth === 0) return "white";
  if (datapoint.depth === 1) return colorHash[datapoint.key];
  let colorNode = datapoint;
  for (let x = datapoint.depth; x > 1; x--) {
    colorNode = colorNode.parent;
  }
  const lightenScale = interpolateLab("white", colorHash[colorNode.key]);

  return lightenScale(Math.max(0, datapoint.depth / 6));
};

export const semioticHierarchicalChart = (
  data: Dx.DataProps["data"],
  schema: Dx.DataProps["schema"],
  options: Dx.DataProps["options"]
) => {
  const {
    hierarchyType: baseHierarchyType = "dendrogram",
    chart,
    selectedDimensions,
    primaryKey,
    colors
  } = options;
  const { metric1 } = chart;

  //a sunburst is just a radial partition
  const hierarchyType =
    baseHierarchyType === "sunburst" ? "partition" : baseHierarchyType;

  if (selectedDimensions.length === 0) {
    return {};
  }

  const nestingParams = nest();

  selectedDimensions.forEach((dim: string) => {
    nestingParams.key((param: {}) => param[dim]);
  });

  const colorHash: { [index: string]: string } = {};
  const sanitizedData: {}[] = [];

  data.forEach((datapoint: Dx.Datapoint) => {
    if (!colorHash[datapoint[selectedDimensions[0]]])
      colorHash[datapoint[selectedDimensions[0]]] =
        colors[Object.keys(colorHash).length];

    sanitizedData.push({
      ...datapoint,
      sanitizedR: datapoint.r,
      r: undefined
    });
  });

  const entries = nestingParams.entries(sanitizedData);
  const rootNode = { values: entries };

  return {
    edges: rootNode,
    edgeStyle: () => ({ fill: "lightgray", stroke: "gray" }),
    nodeStyle: (node: { depth: number }) => {
      return {
        fill: hierarchicalColor(colorHash, node),
        stroke: node.depth === 1 ? "white" : "black",
        strokeOpacity: node.depth * 0.1 + 0.2
      };
    },
    networkType: {
      type: hierarchyType,
      projection: baseHierarchyType === "sunburst" && "radial",
      hierarchySum: (node: { [index: string]: number }) => node[metric1],
      hierarchyChildren: (node: { values: {}[] }) => node.values,
      padding:
        hierarchyType === "treemap" || hierarchyType === "circlepack" ? 2 : 0
    },
    edgeRenderKey: (edge: Object, index: number) => {
      return index;
    },
    baseMarkProps: { forceUpdate: true },
    margin: { left: 100, right: 100, top: 10, bottom: 10 },
    hoverAnnotation: [
      { type: "frame-hover" },
      {
        type: "highlight",
        style: {
          stroke: "red",
          strokeOpacity: 0.5,
          strokeWidth: 5,
          fill: "none"
        }
      }
    ],
    tooltipContent: (hoveredDatapoint: Object) => {
      return (
        <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
          {hierarchicalTooltip(hoveredDatapoint, primaryKey, metric1)}
        </TooltipContent>
      );
    }
  };
};
