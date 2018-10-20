/* @flow */
import * as React from "react";
import { nest } from "d3-collection";
import { scaleLinear } from "d3-scale";
import TooltipContent from "../tooltip-content";

const parentPath = (d, pathArray) => {
  if (d.parent) {
    pathArray = parentPath(d.parent, [d.key, ...pathArray]);
  } else {
    pathArray = ["root", ...pathArray];
  }
  return pathArray;
};

const hierarchicalTooltip = (d, primaryKey, metric) => {
  const pathString = d.parent
    ? parentPath(d.parent, (d.key && [d.key]) || []).join("->")
    : "";
  const content = [];
  if (!d.parent) {
    content.push(<h2 key="hierarchy-title">Root</h2>);
  } else if (d.key) {
    content.push(<h2 key="hierarchy-title">{d.key}</h2>);
    content.push(<p key="path-string">{pathString}</p>);
    content.push(<p key="hierarchy-value">Total Value: {d.value}</p>);
    content.push(<p key="hierarchy-children">Children: {d.children.length}</p>);
  } else {
    content.push(
      <p key="leaf-label">
        {pathString}
        ->
        {primaryKey.map(p => d[p]).join(", ")}
      </p>
    );
    content.push(
      <p key="hierarchy-value">
        {metric}: {d[metric]}
      </p>
    );
  }

  return content;
};

const hierarchicalColor = (colorHash: Object, d: Object) => {
  if (d.depth === 0) return "white";
  if (d.depth === 1) return colorHash[d.key];
  let colorNode = d;
  for (let x = d.depth; x > 1; x--) {
    colorNode = colorNode.parent;
  }
  const lightenScale = scaleLinear()
    .domain([6, 1])
    .clamp(true)
    .range(["white", colorHash[colorNode.key]]);

  return lightenScale(d.depth);
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

  selectedDimensions.forEach(d => {
    nestingParams.key(p => p[d]);
  });
  const colorHash = {};
  const sanitizedData = [];
  data.forEach(d => {
    if (!colorHash[d[selectedDimensions[0]]])
      colorHash[d[selectedDimensions[0]]] =
        colors[Object.keys(colorHash).length];

    sanitizedData.push({
      ...d,
      sanitizedR: d.r,
      r: undefined
    });
  });

  const entries = nestingParams.entries(sanitizedData);
  const rootNode = { values: entries };

  return {
    edges: rootNode,
    edgeStyle: () => ({ fill: "lightgray", stroke: "gray" }),
    nodeStyle: (d: Object) => {
      return {
        fill: hierarchicalColor(colorHash, d),
        stroke: d.depth === 1 ? "white" : "black",
        strokeOpacity: d.depth * 0.1 + 0.2
      };
    },
    networkType: {
      type: hierarchyType,
      hierarchySum: (d: Object) => d[metric1],
      hierarchyChildren: (d: Object) => d.values,
      padding:
        hierarchyType === "treemap" ? 3 : hierarchyType === "circlepack" ? 2 : 0
    },
    edgeRenderKey: (d: Object, i: number) => {
      return i;
    },
    baseMarkProps: { forceUpdate: true },
    margin: { left: 100, right: 100, top: 10, bottom: 10 },
    hoverAnnotation: true,
    tooltipContent: (d: Object) => {
      return (
        <TooltipContent>
          {hierarchicalTooltip(d, primaryKey, metric1)}
        </TooltipContent>
      );
    }
  };
};
