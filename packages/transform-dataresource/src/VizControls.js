import * as React from "react";

import { controlHelpText } from "./docs/chart-docs";
import chartUIStyle from "./css/viz-controls";
import buttonGroupStyle from "./css/button-group";

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
      <select
        value={selectedValue}
        onChange={e => selectionFunction(e.target.value)}
      >
        {metricsList.map(d => (
          <option key={`selector-option-${d}`} value={d} label={d}>
            {d}
          </option>
        ))}
      </select>
    );
  else displayMetrics = <p style={{ margin: 0 }}>{metricsList[0]}</p>;

  return (
    <div className="control-wrapper" title={contextTooltip}>
      <h2>{title}</h2>
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
  setAreaType
}) => {
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
            d => updateChart({ chart: { ...chart, metric1: d } }),
            view === "scatter" || view === "hexbin" ? "X" : "Metric",
            true,
            chart.metric1,
            controlHelpText.metric1[view] || controlHelpText.metric1.default
          )}
        {(view === "scatter" || view === "hexbin") &&
          metricDimSelector(
            metrics.map(d => d.name),
            d => updateChart({ chart: { ...chart, metric2: d } }),
            "Y",
            true,
            chart.metric2,
            controlHelpText.metric2[view] || controlHelpText.metric2.default
          )}
        {(view === "scatter" || view === "bar") &&
          metricDimSelector(
            metrics.map(d => d.name),
            d => updateChart({ chart: { ...chart, metric3: d } }),
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
            d => updateChart({ chart: { ...chart, dim1: d } }),
            view === "summary" ? "Category" : "Color",
            true,
            chart.dim1,
            controlHelpText.dim1[view] || controlHelpText.dim1.default
          )}
        {view === "scatter" &&
          metricDimSelector(
            dimensions.map(d => d.name),
            d => updateChart({ chart: { ...chart, dim2: d } }),
            "Labels",
            false,
            chart.dim2,
            controlHelpText.dim2[view] || controlHelpText.dim2.default
          )}
        {areaType === "contour" &&
          metricDimSelector(
            ["by color"],
            d => updateChart({ chart: { ...chart, dim3: d } }),
            "Multiclass",
            false,
            chart.dim3,
            controlHelpText.dim3[view] || controlHelpText.dim3.default
          )}
        {view === "network" &&
          metricDimSelector(
            dimensions.map(d => d.name),
            d => updateChart({ chart: { ...chart, dim1: d } }),
            "SOURCE",
            true,
            chart.dim1,
            controlHelpText.dim1[view] || controlHelpText.dim1.default
          )}
        {view === "network" &&
          metricDimSelector(
            dimensions.map(d => d.name),
            d => updateChart({ chart: { ...chart, dim2: d } }),
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
            d => updateChart({ hierarchyType: d }),
            "Type",
            true,
            hierarchyType,
            controlHelpText.hierarchyType
          )}
        {view === "summary" &&
          metricDimSelector(
            ["violin", "boxplot", "joy", "heatmap", "histogram"],
            d => updateChart({ summaryType: d }),
            "Type",
            true,
            summaryType,
            controlHelpText.summaryType
          )}
        {view === "line" &&
          metricDimSelector(
            ["array-order", ...metrics.map(d => d.name)],
            d => updateChart({ chart: { ...chart, timeseriesSort: d } }),
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
            <h2>Chart Type</h2>
            {availableLineTypes.map(d => (
              <button
                key={d.lineType}
                className={`button-text ${lineType === d.type && "selected"}`}
                onClick={() => setLineType(d.type)}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
        {view === "hexbin" && (
          <div className="control-wrapper" title={controlHelpText.areaType}>
            <h2>Chart Type</h2>
            <div className="button-group">
              {availableAreaTypes.map(d => (
                <button
                  className={`button-text ${areaType === d.type && "selected"}`}
                  key={d.type}
                  onClick={() => setAreaType(d.type)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {view === "hierarchy" && (
          <div
            className="control-wrapper"
            title={controlHelpText.nestingDimensions}
          >
            <h2>Nesting</h2>
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
            <h2>Categories</h2>
            {dimensions.map(d => (
              <button
                key={`dimensions-select-${d.name}`}
                className={`button-text ${selectedDimensions.indexOf(d.name) !==
                  -1 && "selected"}`}
                onClick={() => updateDimensions(d.name)}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
        {view === "line" && (
          <div
            className="control-wrapper"
            title={controlHelpText.lineDimensions}
          >
            <h2>Metrics</h2>
            {metrics.map(d => (
              <button
                key={`metrics-select-${d.name}`}
                className={`button-text ${selectedMetrics.indexOf(d.name) !==
                  -1 && "selected"}`}
                onClick={() => updateMetrics(d.name)}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <style jsx>{chartUIStyle}</style>
      <style jsx>{buttonGroupStyle}</style>
    </React.Fragment>
  );
};
