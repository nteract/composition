/* @flow */
import * as React from "react";

import TooltipContent from "../tooltip-content";

export const semioticNetwork = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const { networkType = "force", chart, colors } = options;
  const { dim1: sourceDimension, dim2: targetDimension, metric1 } = chart;

  if (
    !sourceDimension ||
    sourceDimension === "none" ||
    !targetDimension ||
    targetDimension === "none"
  ) {
    return {};
  }
  const edgeHash = {};
  const networkData = [];

  data.forEach(edge => {
    if (!edgeHash[`${edge[sourceDimension]}-${edge[targetDimension]}`]) {
      edgeHash[`${edge[sourceDimension]}-${edge[targetDimension]}`] = {
        source: edge[sourceDimension],
        target: edge[targetDimension],
        value: 0,
        weight: 0
      };
      networkData.push(
        edgeHash[`${edge[sourceDimension]}-${edge[targetDimension]}`]
      );
    }
    edgeHash[`${edge[sourceDimension]}-${edge[targetDimension]}`].value +=
      edge[metric1] || 1;
    edgeHash[`${edge[sourceDimension]}-${edge[targetDimension]}`].weight += 1;
  });

  const colorHash = {};
  data.forEach(edge => {
    if (!colorHash[edge[sourceDimension]])
      colorHash[edge[sourceDimension]] =
        colors[Object.keys(colorHash).length % colors.length];
    if (!colorHash[edge[targetDimension]])
      colorHash[edge[targetDimension]] =
        colors[Object.keys(colorHash).length % colors.length];
  });

  networkData.forEach(edge => {
    edge.weight = Math.min(10, edge.weight);
  });

  return {
    edges: networkData,
    edgeType: "halfarrow",
    edgeStyle: (edge: Object) => ({
      fill: colorHash[edge.source.id],
      stroke: colorHash[edge.source.id],
      strokeOpacity: 0.5
    }),
    nodeStyle: (node: Object) => ({
      fill: colorHash[node.id],
      stroke: colorHash[node.id],
      strokeOpacity: 0.5
    }),
    nodeSizeAccessor: (node: Object) => node.degree,
    networkType: {
      type: networkType,
      iterations: 1000
    },
    hoverAnnotation: true,
    tooltipContent: (hoveredNode: Object) => {
      return (
        <TooltipContent x={hoveredNode.x} y={hoveredNode.y}>
          <h3>{hoveredNode.id}</h3>
          <p>Links: {hoveredNode.degree}</p>
          {hoveredNode.value && <p>Value: {hoveredNode.value}</p>}
        </TooltipContent>
      );
    },
    margin: { left: 100, right: 100, top: 10, bottom: 10 }
  };
};
