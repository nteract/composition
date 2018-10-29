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

const identity = x => x;

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
      text={identity}
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
        items={metricsList.map(d => ({ value: d, label: d }))}
        value={selectedValue}
        noResults={NoResultsItem}
        onItemSelect={selectionFunction}
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

export default class VizControls extends React.Component {
  handleLineTypeClick = (event) => {
    this.props.setLineType(event.target.value);
  }
  handleAreaTypeClick = (event) => {
    this.props.setAreaType(event.target.value);
  }
  handleMetricsClick = (event) => {
    this.props.updateMetrics(event.target.value);
  }
  handleDimensionsClick = (event) => {
    this.props.updateDimensions(event.target.value);
  }

  render() {
    const {
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
      lineType,
      areaType,
    } = this.props;

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
              metrics.map(d => d.name),
              d => updateChart({ chart: { ...chart, metric1: d.value } }),
              view === "scatter" || view === "hexbin" ? "X" : "Metric",
              true,
              chart.metric1,
              controlHelpText.metric1[view] || controlHelpText.metric1.default
            )}
          {(view === "scatter" || view === "hexbin") &&
            metricDimSelector(
              metrics.map(d => d.name),
              d => updateChart({ chart: { ...chart, metric2: d.value } }),
              "Y",
              true,
              chart.metric2,
              controlHelpText.metric2[view] || controlHelpText.metric2.default
            )}
          {(view === "scatter" || view === "bar") &&
            metricDimSelector(
              metrics.map(d => d.name),
              d => updateChart({ chart: { ...chart, metric3: d.value } }),
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
              dimensions.map(d => d.name),
              d => updateChart({ chart: { ...chart, dim1: d.value } }),
              view === "summary" ? "Category" : "Color",
              true,
              chart.dim1,
              controlHelpText.dim1[view] || controlHelpText.dim1.default
            )}
          {view === "scatter" &&
            metricDimSelector(
              dimensions.map(d => d.name),
              d => updateChart({ chart: { ...chart, dim2: d.value } }),
              "Labels",
              false,
              chart.dim2,
              controlHelpText.dim2[view] || controlHelpText.dim2.default
            )}
          {areaType === "contour" &&
            metricDimSelector(
              ["by color"],
              d => updateChart({ chart: { ...chart, dim3: d.value } }),
              "Multiclass",
              false,
              chart.dim3,
              controlHelpText.dim3[view] || controlHelpText.dim3.default
            )}
          {view === "network" &&
            metricDimSelector(
              dimensions.map(d => d.name),
              d => updateChart({ chart: { ...chart, dim1: d.value } }),
              "SOURCE",
              true,
              chart.dim1,
              controlHelpText.dim1[view] || controlHelpText.dim1.default
            )}
          {view === "network" &&
            metricDimSelector(
              dimensions.map(d => d.name),
              d => updateChart({ chart: { ...chart, dim2: d.value } }),
              "TARGET",
              true,
              chart.dim2,
              controlHelpText.dim2[view] || controlHelpText.dim2.default
            )}
          {view === "network" &&
            metricDimSelector(
              ["force", "sankey"],
              d => updateChart({ networkType: d }),
              "Type",
              true,
              networkType,
              controlHelpText.networkType
            )}
          {view === "hierarchy" &&
            metricDimSelector(
              ["dendrogram", "treemap", "partition"],
              d => updateChart({ hierarchyType: d.value }),
              "Type",
              true,
              hierarchyType,
              controlHelpText.hierarchyType
            )}
          {view === "summary" &&
            metricDimSelector(
              ["violin", "boxplot", "joy", "heatmap", "histogram"],
              d => updateChart({ summaryType: d.value }),
              "Type",
              true,
              summaryType,
              controlHelpText.summaryType
            )}
          {view === "line" &&
            metricDimSelector(
              ["array-order", ...metrics.map(d => d.name)],
              d => updateChart({ chart: { ...chart, timeseriesSort: d.value } }),
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
                {availableLineTypes.map(d => (
                  <Button
                    key={d.lineType}
                    className={`button-text ${lineType === d.type && "selected"}`}
                    active={lineType === d.type}
                    value={d.type}
                    onClick={this.handleLineTypeClick}
                  >
                    {d.label}
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
                {availableAreaTypes.map(d => (
                  <Button
                    className={`button-text ${areaType === d.type && "selected"}`}
                    key={d.type}
                    value={d.type}
                    onClick={this.handleAreaTypeClick}
                    //                  active={areaType === d.type}
                    active={true}
                  >
                    {d.label}
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
                {dimensions.map(d => (
                  <Button
                    key={`dimensions-select-${d.name}`}
                    className={`button-text ${selectedDimensions.indexOf(
                      d.name
                    ) !== -1 && "selected"}`}
                    value={d.name}
                    onClick={this.handleDimensionsClick}
                    active={selectedDimensions.indexOf(d.name) !== -1}
                  >
                    {d.name}
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
                {metrics.map(d => (
                  <Button
                    key={`metrics-select-${d.name}`}
                    className={`button-text ${selectedMetrics.indexOf(d.name) !==
                      -1 && "selected"}`}
                    value={d.name}
                    onClick={this.handleMetricsClick}
                    active={selectedMetrics.indexOf(d.name) !== -1}
                  >
                    {d.name}
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
  }
}
