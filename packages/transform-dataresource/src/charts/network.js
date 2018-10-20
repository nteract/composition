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

  data.forEach(d => {
    if (!edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`]) {
      edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`] = {
        source: d[sourceDimension],
        target: d[targetDimension],
        value: 0,
        weight: 0
      };
      networkData.push(edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`]);
    }
    edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`].value +=
      d[metric1] || 1;
    edgeHash[`${d[sourceDimension]}-${d[targetDimension]}`].weight += 1;
  });

  const colorHash = {};
  data.forEach(d => {
    if (!colorHash[d[sourceDimension]])
      colorHash[d[sourceDimension]] =
        colors[Object.keys(colorHash).length % colors.length];
    if (!colorHash[d[targetDimension]])
      colorHash[d[targetDimension]] =
        colors[Object.keys(colorHash).length % colors.length];
  });

  networkData.forEach(d => {
    d.weight = Math.min(10, d.weight);
  });

  return {
    edges: networkData,
    edgeType: "halfarrow",
    edgeStyle: (d: Object) => ({
      fill: colorHash[d.source.id],
      stroke: colorHash[d.source.id],
      strokeOpacity: 0.5
    }),
    nodeStyle: (d: Object) => ({
      fill: colorHash[d.id],
      stroke: colorHash[d.id],
      strokeOpacity: 0.5
    }),
    nodeSizeAccessor: (d: Object) => d.degree,
    networkType: {
      type: networkType,
      iterations: 1000
    },
    hoverAnnotation: true,
    tooltipContent: (d: Object) => {
      return (
        <TooltipContent>
          <h3>{d.id}</h3>
          <p>Links: {d.degree}</p>
          {d.value && <p>Value: {d.value}</p>}
        </TooltipContent>
      );
    },
    margin: { left: 100, right: 100, top: 10, bottom: 10 }
  };
};
