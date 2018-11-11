import * as React from "react";
import { Select } from "@blueprintjs/select";
import { Button, ButtonGroup, MenuItem, Code } from "@blueprintjs/core";
import { blueprintCSS, blueprintSelectCSS } from "@nteract/styled-blueprintjsx";

import buttonGroupStyle from "./css/button-group";
import chartUIStyle from "./css/viz-controls";
import { controlHelpText } from "./docs/chart-docs";

/*
const FilmSelect = Select.ofType<{
  title: string;
  year: number;
  rank: number;
}>();
*/

const NoResultsItem = <MenuItem disabled={true} text="No results." />;

const arrowHeadMarker = (
  <marker
    id="arrow"
    refX="3"
    refY="3"
    markerWidth="6"
    markerHeight="6"
    orient="auto-start-reverse"
  >
    <path fill="#5c7080" d="M 0 0 L 6 3 L 0 6 z" />
  </marker>
);

const svgIconSettings = {
  width: "16px",
  height: "16px",
  className: "bp3-icon"
};

const xAxisIcon = (
  <svg {...svgIconSettings}>
    <defs>{arrowHeadMarker}</defs>
    <polyline
      points="3,3 3,13 12,13"
      fill="none"
      stroke="#5c7080"
      markerEnd="url(#arrow)"
    />
  </svg>
);

const yAxisIcon = (
  <svg {...svgIconSettings}>
    <defs>{arrowHeadMarker}</defs>
    <polyline
      points="3,3 3,13 12,13"
      fill="none"
      stroke="#5c7080"
      markerStart="url(#arrow)"
    />
  </svg>
);

const sizeIcon = (
  <svg {...svgIconSettings}>
    <circle cx={3} cy={13} r={2} fill="none" stroke="#5c7080" />
    <circle cx={6} cy={9} r={3} fill="none" stroke="#5c7080" />
    <circle cx={9} cy={5} r={4} fill="none" stroke="#5c7080" />
  </svg>
);

const colorIcon = (
  <svg {...svgIconSettings}>
    <circle cx={3} cy={11} r={3} fill="rgb(179, 51, 29)" />
    <circle cx={13} cy={11} r={3} fill="rgb(87, 130, 220)" />
    <circle cx={8} cy={5} r={3} fill="rgb(229, 194, 9)" />
  </svg>
);

const iconHash = {
  Y: yAxisIcon,
  X: xAxisIcon,
  Size: sizeIcon,
  Color: colorIcon
};

const renderMenuItem = (item, { handleClick, modifiers }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  const text = `${item.label}`;
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      label={text}
      key={text}
      onClick={handleClick}
      text={menuText => menuText}
    />
  );
};

const filterItem = (query, item) => {
  return `${item.label.toLowerCase()}`.indexOf(query.toLowerCase()) >= 0;
};

const metricDimSelector = (
  values,
  selectionFunction,
  title,
  required,
  selectedValue,
  contextTooltip = "Help me help you help yourself"
) => {
  const metricsList = required ? values : ["none", ...values];
  let displayMetrics;
  if (metricsList.length > 1)
    displayMetrics = (
      <Select
        items={metricsList.map(metricName => ({
          value: metricName,
          label: metricName
        }))}
        value={selectedValue}
        noResults={NoResultsItem}
        onItemSelect={e => {
          selectionFunction(e.value);
        }}
        itemRenderer={renderMenuItem}
        itemPredicate={filterItem}
      >
        <Button
          icon={iconHash[title]}
          text={selectedValue}
          rightIcon="double-caret-vertical"
        />
      </Select>
    );
  else displayMetrics = <p style={{ margin: 0 }}>{metricsList[0]}</p>;

  return (
    <div className="control-wrapper" title={contextTooltip}>
      <div>
        <Code>{title}</Code>
      </div>
      {displayMetrics}
      <style jsx>{chartUIStyle}</style>
    </div>
  );
};

const availableLineTypes = [
  {
    type: "line",
    label: "Line Chart"
  },
  {
    type: "stackedarea",
    label: "Stacked Area Chart"
  },
  {
    type: "stackedpercent",
    label: "Stacked Area Chart (Percent)"
  },
  {
    type: "bumparea",
    label: "Ranked Area Chart"
  }
];

const availableAreaTypes = [
  {
    type: "hexbin",
    label: "Hexbin"
  },
  {
    type: "heatmap",
    label: "Heatmap"
  },
  {
    type: "contour",
    label: "Contour Plot"
  }
];

export default ({
  view,
  chart,
  metrics,
  dimensions,
  updateChart,
  selectedDimensions,
  selectedMetrics,
  hierarchyType,
  summaryType,
  networkType,
  setLineType,
  updateMetrics,
  updateDimensions,
  lineType,
  areaType,
  setAreaType,
  data
}) => {
  const metricNames = metrics.map(metric => metric.name);
  const dimensionNames = dimensions.map(dim => dim.name);

  const updateChartGenerator = chartProperty => {
    return metricOrDim =>
      updateChart({ chart: { ...chart, [chartProperty]: metricOrDim } });
  };

  return (
    <React.Fragment>
      <div className="wrapper">
        {(view === "summary" ||
          view === "scatter" ||
          view === "hexbin" ||
          view === "bar" ||
          view === "network" ||
          view === "hierarchy") &&
          metricDimSelector(
            metricNames,
            updateChartGenerator("metric1"),
            view === "scatter" || view === "hexbin" ? "X" : "Metric",
            true,
            chart.metric1,
            controlHelpText.metric1[view] || controlHelpText.metric1.default
          )}
        {(view === "scatter" || view === "hexbin") &&
          metricDimSelector(
            metricNames,
            updateChartGenerator("metric2"),
            "Y",
            true,
            chart.metric2,
            controlHelpText.metric2[view] || controlHelpText.metric2.default
          )}
        {((view === "scatter" && data.length < 1000) || view === "bar") &&
          metricDimSelector(
            metricNames,
            updateChartGenerator("metric3"),
            view === "bar" ? "Width" : "Size",
            false,
            chart.metric3,
            controlHelpText.metric3[view] || controlHelpText.metric3.default
          )}
        {(view === "summary" ||
          view === "scatter" ||
          (view === "hexbin" && areaType === "contour") ||
          view === "bar" ||
          view === "parallel") &&
          metricDimSelector(
            dimensionNames,
            updateChartGenerator("dim1"),
            view === "summary" ? "Category" : "Color",
            true,
            chart.dim1,
            controlHelpText.dim1[view] || controlHelpText.dim1.default
          )}
        {view === "scatter" &&
          metricDimSelector(
            dimensionNames,
            updateChartGenerator("dim2"),
            "Labels",
            false,
            chart.dim2,
            controlHelpText.dim2[view] || controlHelpText.dim2.default
          )}
        {areaType === "contour" &&
          metricDimSelector(
            ["by color"],
            updateChartGenerator("dim3"),
            "Multiclass",
            false,
            chart.dim3,
            controlHelpText.dim3[view] || controlHelpText.dim3.default
          )}
        {view === "network" &&
          metricDimSelector(
            dimensionNames,
            updateChartGenerator("dim1"),
            "SOURCE",
            true,
            chart.dim1,
            controlHelpText.dim1[view] || controlHelpText.dim1.default
          )}
        {view === "network" &&
          metricDimSelector(
            dimensionNames,
            updateChartGenerator("dim2"),
            "TARGET",
            true,
            chart.dim2,
            controlHelpText.dim2[view] || controlHelpText.dim2.default
          )}
        {view === "network" &&
          metricDimSelector(
            ["force", "sankey"],
            selectedNetworkType =>
              updateChart({ networkType: selectedNetworkType }),
            "Type",
            true,
            networkType,
            controlHelpText.networkType
          )}
        {view === "hierarchy" &&
          metricDimSelector(
            ["dendrogram", "treemap", "partition"],
            selectedHierarchyType =>
              updateChart({ hierarchyType: selectedHierarchyType }),
            "Type",
            true,
            hierarchyType,
            controlHelpText.hierarchyType
          )}
        {view === "summary" &&
          metricDimSelector(
            ["violin", "boxplot", "joy", "heatmap", "histogram"],
            selectedSummaryType =>
              updateChart({ summaryType: selectedSummaryType }),
            "Type",
            true,
            summaryType,
            controlHelpText.summaryType
          )}
        {view === "line" &&
          metricDimSelector(
            ["array-order", ...metricNames],
            updateChartGenerator("timeseriesSort"),
            "Sort by",
            true,
            chart.timeseriesSort,
            controlHelpText.timeseriesSort
          )}
        {view === "line" && (
          <div
            title={controlHelpText.lineType}
            style={{ display: "inline-block" }}
          >
            <div>
              <Code>Chart Type</Code>
            </div>
            <ButtonGroup vertical={true}>
              {availableLineTypes.map(lineTypeOption => (
                <Button
                  key={lineTypeOption.type}
                  className={`button-text ${lineType === lineTypeOption.type &&
                    "selected"}`}
                  active={lineType === lineTypeOption.type}
                  onClick={() => setLineType(lineTypeOption.type)}
                >
                  {lineTypeOption.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        )}
        {view === "hexbin" && (
          <div className="control-wrapper" title={controlHelpText.areaType}>
            <div>
              <Code>Chart Type</Code>
            </div>
            <ButtonGroup vertical={true}>
              {availableAreaTypes.map(areaTypeOption => (
                <Button
                  className={`button-text ${areaType === areaTypeOption.type &&
                    "selected"}`}
                  key={areaTypeOption.type}
                  onClick={() => setAreaType(areaTypeOption.type)}
                  active={areaType === areaTypeOption.type}
                >
                  {areaTypeOption.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        )}
        {view === "hierarchy" && (
          <div
            className="control-wrapper"
            title={controlHelpText.nestingDimensions}
          >
            <div>
              <Code>Nesting</Code>
            </div>
            {selectedDimensions.length === 0
              ? "Select categories to nest"
              : `root, ${selectedDimensions.join(", ")}`}
          </div>
        )}
        {(view === "bar" || view === "hierarchy") && (
          <div
            className="control-wrapper"
            title={controlHelpText.barDimensions}
          >
            <div>
              <Code>Categories</Code>
            </div>
            <ButtonGroup vertical={true}>
              {dimensions.map(dim => (
                <Button
                  key={`dimensions-select-${dim.name}`}
                  className={`button-text ${selectedDimensions.indexOf(
                    dim.name
                  ) !== -1 && "selected"}`}
                  onClick={() => updateDimensions(dim.name)}
                  active={selectedDimensions.indexOf(dim.name) !== -1}
                >
                  {dim.name}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        )}
        {view === "line" && (
          <div
            className="control-wrapper"
            title={controlHelpText.lineDimensions}
          >
            <div>
              <Code>Metrics</Code>
            </div>
            <ButtonGroup vertical={true}>
              {metrics.map(metric => (
                <Button
                  key={`metrics-select-${metric.name}`}
                  className={`button-text ${selectedMetrics.indexOf(
                    metric.name
                  ) !== -1 && "selected"}`}
                  onClick={() => updateMetrics(metric.name)}
                  active={selectedMetrics.indexOf(metric.name) !== -1}
                >
                  {metric.name}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        )}
      </div>
      <style jsx>{chartUIStyle}</style>
      <style jsx>{buttonGroupStyle}</style>
      <style jsx>{blueprintCSS}</style>
      <style jsx>{blueprintSelectCSS}</style>
    </React.Fragment>
  );
};
