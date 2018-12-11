/* @flow */
import * as React from "react";
import { scaleLinear, scaleThreshold } from "d3-scale";
import { heatmapping, hexbinning } from "semiotic";

import { numeralFormatting } from "../utilities";
import HTMLLegend from "../HTMLLegend";
import TooltipContent from "../tooltip-content";

import { sortByOrdinalRange } from "./shared";

const binHash = {
  heatmap: heatmapping,
  hexbin: hexbinning
};

const steps = ["none", "#FBEEEC", "#f3c8c2", "#e39787", "#ce6751", "#b3331d"];
const thresholds = scaleThreshold()
  .domain([0.01, 0.2, 0.4, 0.6, 0.8])
  .range(steps);

function combineTopAnnotations(
  topQ: Array<Object>,
  topSecondQ: Array<Object>,
  dim2: string
): any[] {
  const combinedAnnotations = [];
  const combinedHash = {};
  [...topQ, ...topSecondQ].forEach(topDatapoint => {
    const hashD = combinedHash[topDatapoint[dim2]];

    if (hashD) {
      const newCoordinates = (hashD.coordinates && [
        ...hashD.coordinates,
        topDatapoint
      ]) || [topDatapoint, hashD];
      Object.keys(combinedHash[topDatapoint[dim2]]).forEach(key => {
        delete combinedHash[topDatapoint[dim2]][key];
      });
      combinedHash[topDatapoint[dim2]].id = topDatapoint[dim2];
      combinedHash[topDatapoint[dim2]].label = topDatapoint[dim2];
      combinedHash[topDatapoint[dim2]].type = "react-annotation";
      combinedHash[topDatapoint[dim2]].coordinates = newCoordinates;
    } else {
      combinedHash[topDatapoint[dim2]] = {
        type: "react-annotation",
        label: topDatapoint[dim2],
        id: topDatapoint[dim2],
        ...topDatapoint
      };
      combinedAnnotations.push(combinedHash[topDatapoint[dim2]]);
    }
  });
  return combinedAnnotations;
}

export const semioticHexbin = (
  data: Array<Object>,
  schema: Object,
  options: Object
) => {
  return semioticScatterplot(data, schema, options, options.areaType);
};

export const semioticScatterplot = (
  data: Array<Object>,
  schema: Object,
  options: Object,
  type: string = "scatterplot"
) => {
  const height = options.height - 150 || 500;

  const { chart, primaryKey, colors, setColor, dimensions } = options;

  const { dim1, dim2, dim3, metric1, metric2, metric3 } = chart;
  const filteredData: Array<Object> = data.filter(
    (datapoint: Object) =>
      datapoint[metric1] &&
      datapoint[metric2] &&
      (!metric3 || metric3 === "none" || datapoint[metric3])
  );

  const pointTooltip = (hoveredDatapoint: Object) => {
    return (
      <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
        <h3>{primaryKey.map(pkey => hoveredDatapoint[pkey]).join(", ")}</h3>
        {dimensions.map(dim => (
          <p key={`tooltip-dim-${dim.name}`}>
            {dim.name}:{" "}
            {(hoveredDatapoint[dim.name].toString &&
              hoveredDatapoint[dim.name].toString()) ||
              hoveredDatapoint[dim.name]}
          </p>
        ))}
        <p>
          {metric1}: {hoveredDatapoint[metric1]}
        </p>
        <p>
          {metric2}: {hoveredDatapoint[metric2]}
        </p>
        {metric3 && metric3 !== "none" && (
          <p>
            {metric3}: {hoveredDatapoint[metric3]}
          </p>
        )}
      </TooltipContent>
    );
  };

  const areaTooltip = (hoveredDatapoint: Object) => {
    if (hoveredDatapoint.binItems.length === 0) return null;
    return (
      <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
        <h3
          style={{
            fontSize: "14px",
            textTransform: "uppercase",
            margin: "5px",
            fontWeight: 900
          }}
        >
          ID, {metric1}, {metric2}
        </h3>
        {hoveredDatapoint.binItems.map((binnedDatapoint, index) => {
          const id = dimensions
            .map(
              dim =>
                (binnedDatapoint[dim.name].toString &&
                  binnedDatapoint[dim.name].toString()) ||
                binnedDatapoint[dim.name]
            )
            .join(",");
          return (
            <p
              key={id + index}
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                margin: "5px"
              }}
            >
              {id}, {binnedDatapoint[metric1]}, {binnedDatapoint[metric2]}
            </p>
          );
        })}
      </TooltipContent>
    );
  };

  let sizeScale = e => 5; // eslint-disable-line no-unused-vars
  const colorHash = { Other: "grey" };
  const additionalSettings = {};

  let annotations;

  if (dim2 && dim2 !== "none") {
    const topQ = [...filteredData]
      .sort(
        (datapointA, datapointB) => datapointB[metric1] - datapointA[metric1]
      )
      .filter((d, index) => index < 3);
    const topSecondQ = [...filteredData]
      .sort(
        (datapointA, datapointB) => datapointB[metric2] - datapointA[metric2]
      )
      .filter(datapoint => topQ.indexOf(datapoint) === -1)
      .filter((d, index) => index < 3);

    annotations = combineTopAnnotations(topQ, topSecondQ, dim2);
  }

  if (metric3 && metric3 !== "none") {
    const dataMin = Math.min(
      ...filteredData.map(datapoint => datapoint[metric3])
    );
    const dataMax = Math.max(
      ...filteredData.map(datapoint => datapoint[metric3])
    );
    sizeScale = scaleLinear()
      .domain([dataMin, dataMax])
      .range([2, 20]);
  }
  const sortedData = sortByOrdinalRange(
    metric1,
    (metric3 !== "none" && metric3) || metric2,
    "none",
    data
  );

  if (
    (type === "scatterplot" || type === "contour") &&
    dim1 &&
    dim1 !== "none"
  ) {
    const uniqueValues = sortedData.reduce(
      (uniqueArray, datapoint) =>
        (!uniqueArray.find(
          uniqueDim => uniqueDim === datapoint[dim1].toString()
        ) && [...uniqueArray, datapoint[dim1].toString()]) ||
        uniqueArray,
      []
    );

    uniqueValues.forEach((dimValue, index) => {
      colorHash[dimValue] = index > 18 ? "grey" : colors[index % colors.length];
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
  }

  let areas;

  if (
    type === "heatmap" ||
    type === "hexbin" ||
    (type === "contour" && dim3 === "none")
  ) {
    areas = [{ coordinates: filteredData }];

    if (type !== "contour") {
      const calculatedAreas = binHash[type]({
        areaType: { type, bins: 10 },
        data: {
          coordinates: filteredData.map(datapoint => ({
            ...datapoint,
            x: datapoint[metric1],
            y: datapoint[metric2]
          }))
        },
        size: [height, height]
      });
      areas = calculatedAreas;

      const thresholdSteps = [0.2, 0.4, 0.6, 0.8, 1]
        .map(thresholdValue =>
          Math.floor(calculatedAreas.binMax * thresholdValue)
        )
        .reduce(
          (thresholdArray, thresholdValue) =>
            thresholdValue === 0 ||
            thresholdArray.indexOf(thresholdValue) !== -1
              ? thresholdArray
              : [...thresholdArray, thresholdValue],
          []
        );

      const withZeroThresholdSteps = [0, ...thresholdSteps];

      const hexValues = [];

      withZeroThresholdSteps.forEach((thresholdValue, index) => {
        const nextValue = withZeroThresholdSteps[index + 1];
        if (nextValue) {
          hexValues.push(`${thresholdValue + 1} - ${nextValue}`);
        }
      });

      const thresholdColors = [
        "#FBEEEC",
        "#f3c8c2",
        "#e39787",
        "#ce6751",
        "#b3331d"
      ];
      const hexHash = {};

      hexValues.forEach((binLabel, index) => {
        hexHash[binLabel] = thresholdColors[index];
      });

      thresholds
        .domain([0.01, ...thresholdSteps])
        .range([
          "none",
          ...thresholdColors.filter((d, index) => index < thresholdSteps.length)
        ]);

      additionalSettings.afterElements = (
        <HTMLLegend
          valueHash={{}}
          values={hexValues}
          colorHash={hexHash}
          colors={colors}
        />
      );
    }
  } else if (type === "contour") {
    const multiclassHash = {};
    areas = [];
    filteredData.forEach(datapoint => {
      if (!multiclassHash[datapoint[dim1]]) {
        multiclassHash[datapoint[dim1]] = {
          label: datapoint[dim1],
          color: colorHash[datapoint[dim1]],
          coordinates: []
        };
        areas.push(multiclassHash[datapoint[dim1]]);
      }
      multiclassHash[datapoint[dim1]].coordinates.push(datapoint);
    });
  }

  const renderInCanvas =
    (type === "scatterplot" || type === "contour") && data.length > 999;

  return {
    xAccessor: type === "hexbin" || type === "heatmap" ? "x" : metric1,
    yAccessor: type === "hexbin" || type === "heatmap" ? "y" : metric2,
    axes: [
      {
        orient: "left",
        ticks: 6,
        label: metric2,
        tickFormat: numeralFormatting,
        baseline: type === "scatterplot",
        tickSize: type === "heatmap" ? 0 : undefined
      },
      {
        orient: "bottom",
        ticks: 6,
        label: metric1,
        tickFormat: numeralFormatting,
        footer: type === "heatmap",
        baseline: type === "scatterplot",
        tickSize: type === "heatmap" ? 0 : undefined
      }
    ],
    points: (type === "scatterplot" || type === "contour") && data,
    canvasPoints: renderInCanvas,
    areas: areas,
    areaType: { type, bins: 10, thresholds: dim3 === "none" ? 6 : 3 },
    areaStyle: (areaDatapoint: Object) => {
      return {
        fill:
          type === "contour"
            ? "none"
            : thresholds(
                (areaDatapoint.binItems || areaDatapoint.data.binItems).length
              ),
        stroke:
          type !== "contour"
            ? undefined
            : dim3 === "none"
            ? "#BBB"
            : areaDatapoint.parentArea.color,
        strokeWidth: type === "contour" ? 2 : 1
      };
    },
    pointStyle: (datapoint: Object) => ({
      r: renderInCanvas
        ? 2
        : type === "contour"
        ? 3
        : sizeScale(datapoint[metric3]),
      fill: colorHash[datapoint[dim1]] || "black",
      fillOpacity: 0.75,
      stroke: renderInCanvas ? "none" : type === "contour" ? "white" : "black",
      strokeWidth: type === "contour" ? 0.5 : 1,
      strokeOpacity: 0.9
    }),
    hoverAnnotation: true,
    responsiveWidth: false,
    size: [height + 225, height + 80],
    margin: { left: 75, bottom: 50, right: 150, top: 30 },
    annotations: (type === "scatterplot" && annotations) || undefined,
    annotationSettings: {
      layout: { type: "marginalia", orient: "right", marginOffset: 30 }
    },
    tooltipContent:
      ((type === "hexbin" || type === "heatmap") && areaTooltip) ||
      pointTooltip,
    ...additionalSettings
  };
};
