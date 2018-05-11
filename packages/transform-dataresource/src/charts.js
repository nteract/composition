/* @flow */
import * as React from "react";

import { nest } from "d3-collection";
import { scaleLinear, scaleThreshold } from "d3-scale";
import {
  XYFrame,
  OrdinalFrame,
  ResponsiveOrdinalFrame,
  ResponsiveXYFrame,
  ResponsiveNetworkFrame
} from "semiotic";

function createLabelItems(uniqueValues: Array<string>): any[] {
  return uniqueValues.map(d => ({ label: d }));
}

function combineTopAnnotations(
  topQ: Array<Object>,
  topSecondQ: Array<Object>,
  dim2: string
): any[] {
  return [...topQ, ...topSecondQ].map(d => ({
    type: "react-annotation",
    label: d[dim2],
    ...d
  }));
}

function stringOrFnAccessor(d: Object, accessor: string | Function) {
  return typeof accessor === "function" ? accessor(d) : d[accessor];
}

function sortByOrdinalRange(
  oAccessor: Function | string,
  rAccessor: Function | string,
  data: Array<Object>
): any[] {
  return data.sort((a, b) => {
    const oA = stringOrFnAccessor(a, oAccessor);
    const oB = stringOrFnAccessor(b, oAccessor);
    const rA = stringOrFnAccessor(a, rAccessor);
    const rB = stringOrFnAccessor(b, rAccessor);

    if (oB === oA) return rB - rA;
    if (oA < oB) return -1;
    if (oA > oB) return 1;
    return 1;
  });
}

const steps = ["none", "#FBEEEC", "#f3c8c2", "#e39787", "#ce6751", "#b3331d"];
const thresholds = scaleThreshold()
  .domain([0.01, 0.25, 0.5, 0.75, 1])
  .range(steps);

const parentPath = (d, pathArray) => {
  if (d.parent) {
    pathArray = parentPath(d.parent, [d.key, ...pathArray]);
  } else {
    pathArray = ["root", ...pathArray];
  }
  return pathArray;
};

const fontScale = scaleLinear()
  .domain([8, 25])
  .range([14, 8])
  .clamp(true);

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
        {pathString}->{primaryKey.map(p => d[p]).join(", ")}
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

const semioticLineChart = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  let lineData;

  const { selectedMetrics, lineType, metrics, primaryKey } = options;

  lineData = metrics
    .map((d, i) => {
      return {
        color: colors[i % colors.length],
        label: d.name,
        type: d.type,
        coordinates: data.map((p, q) => ({
          value: p[d.name],
          x: q,
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
    lineType: lineType,
    lines: lineData,
    renderKey: (d: Object, i: number) => {
      return d.coordinates ? `line-${d.label}` : `linepoint=${d.label}-${i}`;
    },
    lineStyle: (d: Object) => ({
      fill: d.color,
      stroke: d.color,
      fillOpacity: 0.75
    }),
    pointStyle: (d: Object) => {
      return {
        fill: d.color,
        fillOpacity: 0.75
      };
    },
    axes: [{ orient: "left" }, { orient: "bottom", ticks: 10 }],
    hoverAnnotation: true,
    xAccessor: "x",
    yAccessor: "value",
    showLinePoints: true,
    margin: { top: 20, right: 20, bottom: 50, left: 50 },
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
        <div className="tooltip-content">
          <p>{d.parentLine && d.parentLine.label}</p>
          <p>
            {d.label}: {d.value}
          </p>
          {primaryKey.map((k, ki) => (
            <p key={`key-${ki}`}>
              {k}: {d.originalData[k]}
            </p>
          ))}
        </div>
      );
    }
  };
};

const semioticNetwork = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const { networkType = "force", chart } = options;
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

  const valueMin = Math.min(...networkData.map(d => d.value));
  const valueMax = Math.max(...networkData.map(d => d.value));
  const nodeScale = scaleLinear()
    .domain([valueMin, valueMax])
    .range([2, 20]);
  const colorHash = {};
  data.forEach(d => {
    if (!colorHash[d[sourceDimension]])
      colorHash[d[sourceDimension]] =
        colors[Object.keys(colorHash).length % colors.length];
    if (!colorHash[d[targetDimension]])
      colorHash[d[targetDimension]] =
        colors[Object.keys(colorHash).length % colors.length];
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
      type: networkType == "force" ? "motifs" : networkType,
      iterations: 1000
    },
    hoverAnnotation: true,
    tooltipContent: (d: Object) => {
      return (
        <div className="tooltip-content">
          <h2>{d.id}</h2>
          <p>Links: {d.degree}</p>
          {d.value && <p>Value: {d.value}</p>}
        </div>
      );
    },
    margin: { left: 100, right: 100, top: 10, bottom: 10 }
  };
};

const semioticHierarchicalChart = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const {
    hierarchyType = "dendrogram",
    chart,
    selectedDimensions,
    primaryKey
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
    edgeStyle: (d: Object) => ({ fill: "lightgray", stroke: "gray" }),
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
        <div className="tooltip-content">
          {hierarchicalTooltip(d, primaryKey, metric1)}
        </div>
      );
    }
  };
};

const semioticBarChart = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const additionalSettings = {};
  const colorHash = {};

  const { selectedMetrics, selectedDimensions, chart } = options;

  const { dim1, dim2, metric1, metric3 } = chart;

  const oAccessor =
    selectedDimensions.length === 0
      ? dim1
      : (d: Object) => selectedDimensions.map(p => d[p]).join(",");

  const rAccessor = metric1;

  if (metric3 && metric3 !== "none") {
    additionalSettings.dynamicColumnWidth = metric3;
  }

  if (dim1 && dim1 !== "none") {
    const uniqueValues = data.reduce(
      (p, c) => (!p.find(d => d === c[dim1]) && [...p, c[dim1]]) || p,
      []
    );

    uniqueValues.forEach((d: string, i: number) => {
      colorHash[d] = colors[i % colors.length];
    });

    additionalSettings.legend = {
      title: dim2,
      position: "right",
      width: 200,
      legendGroups: [
        {
          styleFn: (d: Object) => ({ fill: colorHash[d.label] }),
          items: createLabelItems(uniqueValues)
        }
      ]
    };

    if (
      selectedDimensions.length > 0 &&
      selectedDimensions.join(",") !== dim1
    ) {
      additionalSettings.pieceHoverAnnotation = true;
      additionalSettings.tooltipContent = d => {
        return (
          <div className="tooltip-content">
            {dim1 && dim1 !== "none" && <p>{d[dim1]}</p>}
            <p>
              {typeof oAccessor === "function" ? oAccessor(d) : d[oAccessor]}
            </p>
            <p>
              {rAccessor}: {d[rAccessor]}
            </p>
            {metric3 &&
              metric3 !== "none" && (
                <p>
                  {metric3}: {d[metric3]}
                </p>
              )}
          </div>
        );
      };
    }
  }

  const barSettings = {
    type: "bar",
    data: sortByOrdinalRange(oAccessor, rAccessor, data),
    oAccessor,
    rAccessor,
    style: (d: Object) => ({
      fill: colorHash[d[dim1]] || colors[0],
      stroke: colorHash[d[dim1]] || colors[0]
    }),
    oPadding: 5,
    oLabel: (d: Object) => <text transform="rotate(90)">{d}</text>,
    hoverAnnotation: true,
    margin: { top: 10, right: 10, bottom: 100, left: 70 },
    axis: { orient: "left", label: rAccessor },
    tooltipContent: (d: Object) => {
      return (
        <div className="tooltip-content">
          <p>
            {typeof oAccessor === "function"
              ? oAccessor(d.pieces[0])
              : d.pieces[0][oAccessor]}
          </p>
          <p>
            {rAccessor}:{" "}
            {d.pieces.map(p => p[rAccessor]).reduce((p, c) => p + c, 0)}
          </p>
          {metric3 &&
            metric3 !== "none" && (
              <p>
                {metric3}:{" "}
                {d.pieces.map(p => p[metric3]).reduce((p, c) => p + c, 0)}
              </p>
            )}
        </div>
      );
    },
    ...additionalSettings
  };

  return barSettings;
};

const semioticSummaryChart = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  const additionalSettings = {};
  const colorHash = {};

  const { chart, summaryType, primaryKey } = options;

  const { dim1, metric1 } = chart;

  const oAccessor = dim1;

  const rAccessor = metric1;

  if (dim1 && dim1 !== "none") {
    const uniqueValues = data.reduce(
      (p, c) => (!p.find(d => d === c[dim1]) && [...p, c[dim1]]) || p,
      []
    );

    uniqueValues.forEach((d, i) => {
      colorHash[d] = colors[i % colors.length];
    });
  }

  const summarySettings = {
    summaryType: { type: summaryType, bins: 16, amplitude: 20 },
    type: summaryType === "violin" && "swarm",
    projection: "horizontal",
    data: data,
    oAccessor,
    rAccessor,
    summaryStyle: (d: Object) => ({
      fill: colorHash[d[dim1]] || colors[0],
      fillOpacity: 0.8,
      stroke: colorHash[d[dim1]] || colors[0]
    }),
    style: (d: Object) => ({
      fill: colorHash[d[dim1]] || colors[0],
      stroke: "white"
    }),
    oPadding: 5,
    oLabel: (d: Object) => (
      <text textAnchor="end" fontSize={`${fontScale(d.length)}px`}>
        {d}
      </text>
    ),
    margin: { top: 25, right: 10, bottom: 50, left: 100 },
    axis: { orient: "left", label: rAccessor },
    baseMarkProps: { forceUpdate: true },
    pieceHoverAnnotation: summaryType === "violin",
    tooltipContent: (d: Object) => (
      <div className="tooltip-content">
        <h2>{primaryKey.map(p => d[p]).join(", ")}</h2>
        <p>
          {dim1}: {d[dim1]}
        </p>
        <p>
          {rAccessor}: {d[rAccessor]}
        </p>
      </div>
    ),
    ...additionalSettings
  };

  return summarySettings;
};

const semioticHexbin = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  return semioticScatterplot(data, schema, options, true);
};

const semioticScatterplot = (
  data: Array<Object>,
  schema: Object,
  options: Object,
  hexbin: boolean = false
) => {
  const height = options.height - 150 || 500;

  const { chart, primaryKey } = options;

  const { dim1, dim2, metric1, metric2, metric3 } = chart;

  const pointTooltip = (d: Object) => (
    <div className="tooltip-content">
      <h2>{primaryKey.map(p => d[p]).join(", ")}</h2>
      {dim1 &&
        dim1 !== "none" && (
          <p>
            {dim1}: {d[dim1]}
          </p>
        )}
      <p>
        {metric1}: {d[metric1]}
      </p>
      <p>
        {metric2}: {d[metric2]}
      </p>
      {metric3 &&
        metric3 !== "none" && (
          <p>
            {metric3}: {d[metric3]}
          </p>
        )}
    </div>
  );

  const areaTooltip = (d: Object) => (
    <div className="tooltip-content">
      <h2
        style={{
          fontSize: "14px",
          textTransform: "uppercase",
          margin: "5px",
          fontWeight: 900
        }}
      >
        ID, {metric1}, {metric2}
      </h2>
      {d.binItems.map(d => (
        <p
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            margin: "5px"
          }}
        >
          {primaryKey.map(p => d[p]).join(", ")}, {d[metric1]}, {d[metric2]}
        </p>
      ))}
    </div>
  );

  let sizeScale = e => 5;
  const colorHash = {};
  const additionalSettings = {};

  let annotations;

  if (dim2 && dim2 !== "none") {
    const topQ = [...data]
      .sort((a, b) => b[metric1] - a[metric1])
      .filter((d, i) => i < 3);
    const topSecondQ = [...data]
      .sort((a, b) => b[metric2] - a[metric2])
      .filter(d => topQ.indexOf(d) === -1)
      .filter((d, i) => i < 3);

    annotations = combineTopAnnotations(topQ, topSecondQ, dim2);
  }

  if (metric3 && metric3 !== "none") {
    const dataMin = Math.min(...data.map(d => d[metric3]));
    const dataMax = Math.max(...data.map(d => d[metric3]));
    sizeScale = scaleLinear()
      .domain([dataMin, dataMax])
      .range([2, 20]);
  }
  if (!hexbin && dim1 && dim1 !== "none") {
    const uniqueValues = data.reduce(
      (p, c) => (!p.find(d => d === c[dim1]) && [...p, c[dim1]]) || p,
      []
    );

    uniqueValues.forEach((d, i) => {
      colorHash[d] = colors[i % colors.length];
    });

    additionalSettings.legend = {
      title: dim1,
      position: "right",
      width: 200,
      legendGroups: [
        {
          styleFn: (d: Object) => ({ fill: colorHash[d.label] }),
          items: createLabelItems(uniqueValues)
        }
      ]
    };
  }
  return {
    xAccessor: metric1,
    yAccessor: metric2,
    axes: [
      { orient: "left", ticks: 6, label: metric2 },
      { orient: "bottom", ticks: 6, label: metric1 }
    ],
    points: !hexbin && data,
    areas: hexbin && [{ coordinates: data }],
    areaType: { type: "hexbin", bins: 10 },
    areaStyle: (d: Object) => ({
      fill: thresholds(d.percent),
      stroke: "black"
    }),
    pointStyle: (d: Object) => ({
      r: sizeScale(d[metric3]),
      fill: colorHash[d[dim1]] || "black",
      fillOpacity: 0.75,
      stroke: "black",
      strokeOpacity: 0.9
    }),
    hoverAnnotation: true,
    responsiveWidth: false,
    size: [height + 200, height + 50],
    margin: { left: 75, bottom: 50, right: 150, top: 30 },
    annotations: !hexbin && annotations,
    tooltipContent: (hexbin && areaTooltip) || pointTooltip,
    ...additionalSettings
  };
};

export const semioticSettings = {
  line: {
    Frame: ResponsiveXYFrame,
    controls: "switch between linetype",
    chartGenerator: semioticLineChart
  },
  scatter: {
    Frame: ResponsiveXYFrame,
    controls: "switch between modes",
    chartGenerator: semioticScatterplot
  },
  hexbin: {
    Frame: ResponsiveXYFrame,
    controls: "switch between modes",
    chartGenerator: semioticHexbin
  },
  bar: {
    Frame: ResponsiveOrdinalFrame,
    controls: "switch between modes",
    chartGenerator: semioticBarChart
  },
  summary: {
    Frame: ResponsiveOrdinalFrame,
    controls: "switch between modes",
    chartGenerator: semioticSummaryChart
  },
  network: {
    Frame: ResponsiveNetworkFrame,
    controls: "switch between modes",
    chartGenerator: semioticNetwork
  },
  hierarchy: {
    Frame: ResponsiveNetworkFrame,
    controls: "switch between modes",
    chartGenerator: semioticHierarchicalChart
  }
};

export const colors = [
  "#DA752E",
  "#E5C209",
  "#1441A0",
  "#B86117",
  "#4D430C",
  "#1DB390",
  "#B3331D",
  "#088EB2",
  "#417505",
  "#E479A8",
  "#F9F39E",
  "#5782DC",
  "#EBA97B",
  "#A2AB60",
  "#B291CF",
  "#8DD2C2",
  "#E6A19F",
  "#3DC7E0",
  "#98CE5B"
];
