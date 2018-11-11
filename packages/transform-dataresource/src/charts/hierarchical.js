/* @flow */
import * as React from "react";
import { nest } from "d3-collection";
import { scaleLinear } from "d3-scale";

import TooltipContent from "../tooltip-content";

const parentPath = (datapoint, pathArray) => {
  if (datapoint.parent) {
    pathArray = parentPath(datapoint.parent, [datapoint.key, ...pathArray]);
  } else {
    pathArray = ["root", ...pathArray];
  }
  return pathArray;
};

const hierarchicalTooltip = (datapoint, primaryKey, metric) => {
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
        {primaryKey.map(pkey => datapoint[pkey]).join(", ")}
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

const hierarchicalColor = (colorHash: Object, datapoint: Object) => {
  if (datapoint.depth === 0) return "white";
  if (datapoint.depth === 1) return colorHash[datapoint.key];
  let colorNode = datapoint;
  for (let x = datapoint.depth; x > 1; x--) {
    colorNode = colorNode.parent;
  }
  const lightenScale = scaleLinear()
    .domain([6, 1])
    .clamp(true)
    .range(["white", colorHash[colorNode.key]]);

  return lightenScale(datapoint.depth);
};

export const semioticHierarchicalChart = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const {
    hierarchyType = "dendrogram",
    chart,
    selectedDimensions,
    primaryKey,
    colors
  } = options;
  const { metric1 } = chart;

  if (selectedDimensions.length === 0) {
    return {};
  }

  const nestingParams = nest();

  selectedDimensions.forEach(dim => {
    nestingParams.key(param => param[dim]);
  });
  const colorHash = {};
  const sanitizedData = [];
  data.forEach(datapoint => {
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
    nodeStyle: (node: Object) => {
      return {
        fill: hierarchicalColor(colorHash, node),
        stroke: node.depth === 1 ? "white" : "black",
        strokeOpacity: node.depth * 0.1 + 0.2
      };
    },
    networkType: {
      type: hierarchyType,
      hierarchySum: (node: Object) => node[metric1],
      hierarchyChildren: (node: Object) => node.values,
      padding:
        hierarchyType === "treemap" ? 3 : hierarchyType === "circlepack" ? 2 : 0
    },
    edgeRenderKey: (edge: Object, index: number) => {
      return index;
    },
    baseMarkProps: { forceUpdate: true },
    margin: { left: 100, right: 100, top: 10, bottom: 10 },
    hoverAnnotation: true,
    tooltipContent: (hoveredDatapoint: Object) => {
      return (
        <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
          {hierarchicalTooltip(hoveredDatapoint, primaryKey, metric1)}
        </TooltipContent>
      );
    }
  };
};
