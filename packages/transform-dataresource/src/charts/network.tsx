/* @flow */
import * as React from "react";
import { scaleLinear } from "d3-scale";

import TooltipContent from "../tooltip-content";

const fontScale = scaleLinear()
  .domain([5, 30])
  .range([8, 16])
  .clamp(true);

const edgeStyles = {
  force: (colorHash: Object) => (edge: Object) => ({
    fill: colorHash[edge.source.id],
    stroke: colorHash[edge.source.id],
    strokeOpacity: 0.25
  }),
  sankey: (colorHash: Object) => (edge: Object) => ({
    fill: colorHash[edge.source.id],
    stroke: colorHash[edge.source.id],
    strokeOpacity: 0.25
  }),
  matrix: (colorHash: Object) => (edge: Object) => ({
    fill: colorHash[edge.source.id],
    stroke: "none"
  }),
  arc: (colorHash: Object) => (edge: Object) => ({
    fill: "none",
    stroke: colorHash[edge.source.id],
    strokeWidth: edge.weight || 1,
    strokeOpacity: 0.75
  })
};

const nodeStyles = {
  force: (colorHash: Object) => (node: Object) => ({
    fill: colorHash[node.id],
    stroke: colorHash[node.id],
    strokeOpacity: 0.5
  }),
  sankey: (colorHash: Object) => (node: Object) => ({
    fill: colorHash[node.id],
    stroke: colorHash[node.id],
    strokeOpacity: 0.5
  }),
  matrix: () => () => ({
    fill: "none",
    stroke: "#666",
    strokeOpacity: 1
  }),
  arc: (colorHash: Object) => (node: Object) => ({
    fill: colorHash[node.id],
    stroke: colorHash[node.id],
    strokeOpacity: 0.5
  })
};
const nodeLinkHover = [
  { type: "frame-hover" },
  {
    type: "highlight",
    style: { stroke: "red", strokeOpacity: 0.5, strokeWidth: 5, fill: "none" }
  }
];
const hoverAnnotationSettings = {
  force: nodeLinkHover,
  sankey: nodeLinkHover,
  matrix: [
    { type: "frame-hover" },
    { type: "highlight", style: { fill: "red", fillOpacity: 0.5 } }
  ],
  arc: nodeLinkHover
};

const nodeLabeling = {
  none: false,
  static: true,
  scaled: d => {
    if (!d.nodeSize || d.nodeSize < 5) {
      return null;
    }
    return (
      <text
        textAnchor="middle"
        y={fontScale(d.nodeSize) / 2}
        fontSize={`${fontScale(d.nodeSize)}px`}
      >
        {d.id}
      </text>
    );
  }
};

export const semioticNetwork = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const { networkType = "force", chart, colors } = options;
  const {
    dim1: sourceDimension,
    dim2: targetDimension,
    metric1,
    networkLabel
  } = chart;

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
    edgeType: networkType === "force" && "halfarrow",
    edgeStyle: edgeStyles[networkType](colorHash),
    nodeStyle: nodeStyles[networkType](colorHash),
    nodeSizeAccessor: (node: Object) => node.degree,
    networkType: {
      type: networkType,
      iterations: 1000
    },
    hoverAnnotation: hoverAnnotationSettings[networkType],
    tooltipContent: (hoveredNode: Object) => {
      return (
        <TooltipContent x={hoveredNode.x} y={hoveredNode.y}>
          <h3>{hoveredNode.id}</h3>
          <p>Links: {hoveredNode.degree}</p>
          {hoveredNode.value && <p>Value: {hoveredNode.value}</p>}
        </TooltipContent>
      );
    },
    nodeLabels: networkType === "matrix" ? false : nodeLabeling[networkLabel],
    margin: { left: 100, right: 100, top: 10, bottom: 10 }
  };
};
