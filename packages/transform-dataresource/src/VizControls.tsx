import * as React from "react";
import { Select } from "@blueprintjs/select";
import {
  Button,
  ButtonGroup,
  MenuItem,
  Code,
  IconName
} from "@blueprintjs/core";
import { BlueprintCSS, BlueprintSelectCSS } from "@nteract/styled-blueprintjsx";

import buttonGroupStyle from "./css/button-group";
import chartUIStyle from "./css/viz-controls";
import { controlHelpText, ChartOptionTypes } from "./docs/chart-docs";

import * as Dx from "Dx";

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

const iconHash: { [key in "Y" | "X" | "Size" | "Color"]: JSX.Element } = {
  Y: yAxisIcon,
  X: xAxisIcon,
  Size: sizeIcon,
  Color: colorIcon
};

type MenuItemType = {
  label: string;
};
type ModifiersType = {
  matchesPredicate: boolean;
  active: boolean;
  disabled: boolean;
};

const renderMenuItem = (
  item: MenuItemType,
  {
    handleClick,
    modifiers
  }: {
    handleClick: (event: React.MouseEvent<HTMLElement>) => void;
    modifiers: ModifiersType;
  }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  const text = `${item.label}`;
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={text}
      onClick={handleClick}
      text={text}
    />
  );
};

const filterItem = (query: string, item: MenuItemType) => {
  return `${item.label.toLowerCase()}`.indexOf(query.toLowerCase()) >= 0;
};

const getIcon = (title: string) => {
  if (title === "X" || title === "Y" || title === "Size" || title == "Color") {
    return iconHash[title];
  } else {
    console.warn("Icon title not supported");
    return title as IconName;
  }
};

const metricDimSelector = (
  values: Array<string>,
  selectionFunction: (val: string) => void,
  title: string,
  required: boolean,
  selectedValue: string,
  contextTooltip = "Help me help you help yourself"
) => {
  const metricsList = required ? values : ["none", ...values];
  let displayMetrics;
  let icon;

  if (metricsList.length > 1)
    displayMetrics = (
      <Select
        items={metricsList.map((metricName: string) => ({
          value: metricName,
          label: metricName
        }))}
        query={selectedValue}
        noResults={NoResultsItem}
        onItemSelect={(
          item: { value: string; label: string },
          event?: React.SyntheticEvent<HTMLElement>
        ): void => {
          selectionFunction(item.value);
        }}
        itemRenderer={renderMenuItem}
        itemPredicate={filterItem}
      >
        <Button
          icon={getIcon(title)}
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

<<<<<<< HEAD
type ChartTypes = { [key in ExplorationTypes]: string };
type VizControlParams = {
  view: string;
  chart: ChartTypes;
=======
type ChartOptions = { [key in ChartOptionTypes]: string };
type VizControlParams = {
  view: string;
  chart: ChartOptions;
>>>>>>> Update to remove errors reported in VS Code
  metrics: Array<{ name: string }>;
  dimensions: Array<{ name: string }>;
  updateChart: Function;
  selectedDimensions: Array<string>;
  selectedMetrics: Array<string>;
  hierarchyType: string;
  summaryType: string;
  networkType: string;
  setLineType: Function;
  updateMetrics: Function;
  updateDimensions: Function;
  lineType: string;
  areaType: string;
<<<<<<< HEAD
  setAreaType: (label: string) => void;
=======
  setAreaType: (label: Dx.AreaType) => void;
>>>>>>> Update to remove errors reported in VS Code
  data: Array<Object>;
};
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
}: VizControlParams) => {
  const metricNames = metrics.map(metric => metric.name);
  const dimensionNames = dimensions.map(dim => dim.name);

  const updateChartGenerator = (chartProperty: string) => {
    return (metricOrDim: string) =>
      updateChart({ chart: { ...chart, [chartProperty]: metricOrDim } });
  };

  const getControlHelpText = (view: string, metricOrDim: string) => {
    if (Object.keys(controlHelpText).find(mOrD => mOrD === metricOrDim)) {
<<<<<<< HEAD
      let mOrD = metricOrDim as ExplorationTypes;
=======
      let mOrD = metricOrDim as ChartOptionTypes;
>>>>>>> Update to remove errors reported in VS Code
      const views =
        controlHelpText[mOrD] != null ? controlHelpText[mOrD] : null;
      if (views == null) {
        return "";
      }
      if (typeof views === "string") {
        return views;
      }
      if (views[view] != null) {
        return views[view];
      } else {
        return views.default;
      }
    }
    return "";
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
            getControlHelpText(view, "metric1")
          )}
        {(view === "scatter" || view === "hexbin") &&
          metricDimSelector(
            metricNames,
            updateChartGenerator("metric2"),
            "Y",
            true,
            chart.metric2,
            getControlHelpText(view, "metric2")
          )}
        {((view === "scatter" && data.length < 1000) || view === "bar") &&
          metricDimSelector(
            metricNames,
            updateChartGenerator("metric3"),
            view === "bar" ? "Width" : "Size",
            false,
            chart.metric3,
            getControlHelpText(view, "metric3")
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
            getControlHelpText(view, "dim1")
          )}
        {view === "scatter" &&
          metricDimSelector(
            dimensionNames,
            updateChartGenerator("dim2"),
            "Labels",
            false,
            chart.dim2,
            getControlHelpText(view, "dim2")
          )}
        {view === "hexbin" &&
          areaType === "contour" &&
          metricDimSelector(
            ["by color"],
            updateChartGenerator("dim3"),
            "Multiclass",
            false,
            chart.dim3,
            getControlHelpText(view, "dim3")
          )}
        {view === "network" &&
          metricDimSelector(
            dimensionNames,
            updateChartGenerator("dim1"),
            "SOURCE",
            true,
            chart.dim1,
            getControlHelpText(view, "dim1")
          )}
        {view === "network" &&
          metricDimSelector(
            dimensionNames,
            updateChartGenerator("dim2"),
            "TARGET",
            true,
            chart.dim2,
            getControlHelpText(view, "dim2")
          )}
        {view === "network" &&
          metricDimSelector(
            ["matrix", "arc", "force", "sankey"],
            selectedNetworkType =>
              updateChart({ networkType: selectedNetworkType }),
            "Type",
            true,
            networkType,
            controlHelpText.networkType as string
          )}
        {view === "network" &&
          metricDimSelector(
            ["static", "scaled"],
            updateChartGenerator("networkLabel"),
            "Show Labels",
            false,
            chart.networkLabel,
            controlHelpText.networkLabel as string
          )}
        {view === "hierarchy" &&
          metricDimSelector(
            ["dendrogram", "treemap", "partition", "sunburst"],
            selectedHierarchyType =>
              updateChart({ hierarchyType: selectedHierarchyType }),
            "Type",
            true,
            hierarchyType,
            controlHelpText.hierarchyType as string
          )}
        {view === "summary" &&
          metricDimSelector(
            ["violin", "boxplot", "joy", "heatmap", "histogram"],
            selectedSummaryType =>
              updateChart({ summaryType: selectedSummaryType }),
            "Type",
            true,
            summaryType,
            controlHelpText.summaryType as string
          )}
        {view === "line" &&
          metricDimSelector(
            ["array-order", ...metricNames],
            updateChartGenerator("timeseriesSort"),
            "Sort by",
            true,
            chart.timeseriesSort,
            controlHelpText.timeseriesSort as string
          )}
        {view === "line" && (
          <div
            title={controlHelpText.lineType as string}
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
          <div
            className="control-wrapper"
            title={controlHelpText.areaType as string}
          >
            <div>
              <Code>Chart Type</Code>
            </div>
            <ButtonGroup vertical={true}>
              {availableAreaTypes.map(areaTypeOption => {
                const areaTypeOptionType = areaTypeOption.type;
                if (
                  areaTypeOptionType === "contour" ||
                  areaTypeOptionType === "hexbin" ||
                  areaTypeOptionType === "heatmap"
                ) {
                  return (
                    <Button
                      className={`button-text ${areaType ===
                        areaTypeOptionType && "selected"}`}
                      key={areaTypeOptionType}
                      onClick={() => setAreaType(areaTypeOptionType)}
                      active={areaType === areaTypeOptionType}
                    >
                      {areaTypeOption.label}
                    </Button>
                  );
                } else {
                  return <div />;
                }
              })}
            </ButtonGroup>
          </div>
        )}
        {view === "hierarchy" && (
          <div
            className="control-wrapper"
            title={controlHelpText.nestingDimensions as string}
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
            title={controlHelpText.barDimensions as string}
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
            title={controlHelpText.lineDimensions as string}
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
      <BlueprintCSS />
      <BlueprintSelectCSS />
    </React.Fragment>
  );
};
