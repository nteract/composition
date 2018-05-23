/* @flow */
import { hot } from "react-hot-loader";

import * as React from "react";
import VirtualizedGrid from "./virtualized-grid";
import {
  GraphOcticon as BarGraphOcticon,
  DatabaseOcticon,
  Beaker
} from "@nteract/octicons";

import { semioticSettings, colors } from "./charts";
import {
  TreeIcon,
  NetworkIcon,
  BoxplotIcon,
  ScatterplotIcon,
  LineChartIcon,
  BarChartIcon,
  HexbinIcon
} from "./icons";

type Props = {
  data: Object,
  metadata: Object,
  theme?: string,
  expanded?: boolean,
  height?: number
};

type LineType = "line" | "stackedarea" | "bumparea" | "stackedpercent";

type State = {
  view: "line" | "bar" | "scatter" | "grid" | "network" | "summary" | "hexbin",
  metrics: Array<string>,
  dimensions: Array<string>,
  selectedMetrics: Array<string>,
  selectedDimensions: Array<string>,
  networkType: "force" | "sankey",
  hierarchyType: "dendrogram" | "treemap" | "partition",
  pieceType: "bar" | "point" | "swarm" | "clusterbar",
  colorValue: string,
  sizeValue: string,
  xValue: string,
  yValue: string,
  targetDimension: string,
  sourceDimension: string,
  labelValue: string,
  summaryType: "violin" | "joy" | "histogram" | "heatmap" | "boxplot",
  lineType: LineType,
  chart: Object,
  displayChart: Object
};

const generateChartKey = ({
  view,
  lineType,
  selectedDimensions,
  selectedMetrics,
  pieceType,
  summaryType,
  networkType,
  hierarchyType,
  chart
}) =>
  `${view}-${lineType}-${selectedDimensions.join(",")}-${selectedMetrics.join(
    ","
  )}-${pieceType}-${summaryType}-${networkType}-${hierarchyType}-${JSON.stringify(
    chart
  )}`;

const DataResourceTransformGrid = ({
  data: { data, schema },
  theme,
  expanded,
  height
}) => {
  return (
    <VirtualizedGrid
      data={data}
      schema={schema}
      theme={theme}
      expanded={expanded}
      height={height}
      // style={{ marginRight: "10px" }}
    />
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

const metricDimSelector = (
  values,
  selectionFunction,
  title,
  required,
  selectedValue
) => {
  return (
    <div style={{ display: "inline-block", margin: "0 10px" }}>
      <h2>{title}</h2>
      <select
        value={selectedValue}
        onChange={e => selectionFunction(e.target.value)}
      >
        {(required ? values : ["none", ...values]).map(d => (
          <option key={`selector-option-${d}`} value={d} label={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
};

/*
  contour is an option for scatterplot
  pie is a transform on bar
*/

const MetadataWarning = ({ metadata }) => {
  const warning =
    metadata && metadata.sampled ? (
      <span>
        <b>NOTE:</b> This data is sampled
      </span>
    ) : null;

  return (
    <div
      style={{
        fontFamily:
          "Source Sans Pro, Helvetica Neue, Helvetica, Arial, sans-serif"
      }}
    >
      <div
        style={{
          backgroundColor: "#cec",
          color: "#111",
          padding: "10px",
          paddingLeft: "20px"
        }}
      >
        This interactive data explorer is in the works.{" "}
        <a
          href="https://github.com/nteract/nteract/issues/new"
          style={{
            color: "#333"
          }}
        >
          Help us improve it!
        </a>
        <Beaker
          style={{
            color: "#111",
            verticalAlign: "center",
            textAlign: "center",
            paddingLeft: "10px"
          }}
        />
      </div>
      {warning ? (
        <div
          style={{
            backgroundColor: "#cce",
            padding: "10px",
            paddingLeft: "20px"
          }}
        >
          {warning}
        </div>
      ) : null}
    </div>
  );
};

///////////////////////////////

class DataResourceTransform extends React.Component<Props, State> {
  static MIMETYPE = "application/vnd.dataresource+json";

  static defaultProps = {
    metadata: {},
    height: 500
  };

  constructor(props: Props) {
    super(props);
    //DEFAULT FROM PROPS

    const dimensions = props.data.schema.fields.filter(
      d => d.type === "string"
    );

    const metrics = props.data.schema.fields
      .filter(d => d.type === "integer" || d.type === "number")
      .filter(d => !props.data.schema.primaryKey.find(p => p === d.name));

    this.state = {
      view: "grid",
      lineType: "line",
      selectedDimensions: [],
      selectedMetrics: [],
      pieceType: "bar",
      summaryType: "violin",
      networkType: "force",
      hierarchyType: "dendrogram",
      colorValue: "none",
      labelValue: "none",
      sizeValue: "none",
      sourceDimension: "none",
      targetDimension: "none",
      xValue: "none",
      yValue: "none",
      dimensions,
      metrics,
      ui: {},
      chart: {
        metric1: (metrics[0] && metrics[0].name) || "none",
        metric2: (metrics[1] && metrics[1].name) || "none",
        metric3: "none",
        dim1: (dimensions[0] && dimensions[0].name) || "none",
        dim2: (dimensions[1] && dimensions[1].name) || "none",
        dim3: (dimensions[2] && dimensions[2].name) || "none"
      },
      displayChart: {}
    };
  }

  //SET STATE WHENEVER CHANGES

  //HELD IN STATE LIKE SO
  //UI CHOICES
  //CHART CHOICES
  //DERIVED DATA

  shouldComponentUpdate(): boolean {
    return true;
  }

  updateChart = (updatedState: Object) => {
    const {
      view,
      dimensions,
      metrics,
      chart,
      lineType,
      selectedDimensions,
      selectedMetrics,
      pieceType,
      summaryType,
      networkType,
      hierarchyType
    } = { ...this.state, ...updatedState };

    const { data, height = 500 } = this.props;
    const { primaryKey } = data.schema;

    const { Frame, chartGenerator } = semioticSettings[view];

    const chartKey = generateChartKey({
      view,
      lineType,
      selectedDimensions,
      selectedMetrics,
      pieceType,
      summaryType,
      networkType,
      hierarchyType,
      chart
    });

    const frameSettings = chartGenerator(data.data, data.schema, {
      metrics,
      chart,
      colors,
      height,
      lineType,
      selectedDimensions,
      selectedMetrics,
      pieceType,
      summaryType,
      networkType,
      hierarchyType,
      primaryKey
    });

    const display = (
      <div style={{ marginLeft: "50px", width: "calc(100% - 50px)" }}>
        <Frame
          responsiveWidth={true}
          size={[500, height - 200]}
          {...frameSettings}
        />
        {(view === "summary" ||
          view === "scatter" ||
          view === "hexbin" ||
          view === "bar" ||
          view === "network" ||
          view === "hierarchy") &&
          metricDimSelector(
            metrics.map(d => d.name),
            d => this.updateChart({ chart: { ...chart, metric1: d } }),
            view === "scatter" || view === "hexbin" ? "X" : "Metric",
            true,
            chart.metric1
          )}
        {(view === "scatter" || view === "hexbin") &&
          metricDimSelector(
            metrics.map(d => d.name),
            d => this.updateChart({ chart: { ...chart, metric2: d } }),
            "Y",
            true,
            chart.metric2
          )}
        {(view === "scatter" || view === "bar") &&
          metricDimSelector(
            metrics.map(d => d.name),
            d => this.updateChart({ chart: { ...chart, metric3: d } }),
            view === "bar" ? "WIDTH" : "SIZE",
            false,
            chart.metric3
          )}
        {(view === "summary" || view === "scatter" || view === "bar") &&
          metricDimSelector(
            dimensions.map(d => d.name),
            d => this.updateChart({ chart: { ...chart, dim1: d } }),
            view === "summary" ? "CATEGORY" : "COLOR",
            true,
            chart.dim1
          )}
        {view === "scatter" &&
          metricDimSelector(
            dimensions.map(d => d.name),
            d => this.updateChart({ chart: { ...chart, dim2: d } }),
            "LABELS",
            false,
            chart.dim2
          )}
        {view === "network" &&
          metricDimSelector(
            dimensions.map(d => d.name),
            d => this.updateChart({ chart: { ...chart, dim1: d } }),
            "SOURCE",
            true,
            chart.dim1
          )}
        {view === "network" &&
          metricDimSelector(
            dimensions.map(d => d.name),
            d => this.updateChart({ chart: { ...chart, dim2: d } }),
            "TARGET",
            true,
            chart.dim2
          )}
        {view === "network" &&
          metricDimSelector(
            ["force", "sankey"],
            d => this.updateChart({ networkType: d }),
            "TYPE",
            true,
            networkType
          )}
        {view === "hierarchy" &&
          metricDimSelector(
            ["dendrogram", "treemap", "partition"],
            d => this.updateChart({ hierarchyType: d }),
            "TYPE",
            true,
            hierarchyType
          )}
        {view === "summary" &&
          metricDimSelector(
            ["violin", "boxplot", "joy", "heatmap", "histogram"],
            d => this.updateChart({ summaryType: d }),
            "TYPE",
            true,
            summaryType
          )}
        {view === "line" && (
          <div>
            {availableLineTypes.map(d => (
              <button
                style={{
                  marginLeft: "20px",
                  color: lineType === d.type ? "lightgray" : "black"
                }}
                onClick={() => this.setLineType(d.type)}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}
        {view === "hierarchy" && (
          <div
            style={{
              display: "inline-block",
              width: "30%",
              marginLeft: "20px"
            }}
          >
            <h2>Nesting</h2>
            {selectedDimensions.length === 0
              ? "Select categories to nest"
              : `root, ${selectedDimensions.join(", ")}`}
          </div>
        )}
        {(view === "bar" || view === "hierarchy") && (
          <div
            style={{
              display: "inline-block",
              width: "30%",
              marginLeft: "20px"
            }}
          >
            <h2>Categories</h2>
            {dimensions.map(d => (
              <button
                key={`dimensions-select-${d.name}`}
                style={{
                  marginLeft: "20px",
                  color:
                    selectedDimensions.indexOf(d.name) !== -1
                      ? "black"
                      : "lightgray"
                }}
                onClick={() => this.updateDimensions(d.name)}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
        {view === "line" && (
          <div>
            <h1>Metrics</h1>
            {metrics.map(d => (
              <button
                key={`metrics-select-${d.name}`}
                style={{
                  marginLeft: "20px",
                  color:
                    selectedMetrics.indexOf(d.name) !== -1
                      ? "black"
                      : "lightgray"
                }}
                onClick={() => this.updateMetrics(d.name)}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
        <style jsx>{`
          :global(.tooltip-content) {
            color: black;
            padding: 10px;
            z-index: 999999;
            min-width: 120px;
            background: white;
            border: 1px solid black;
            position: relative;
            transform: translate(calc(-50% + 7px), calc(0% + 20px));
          }
          :global(.tooltip-content:before) {
            border-left: inherit;
            border-top: inherit;
            top: -8px;
            left: calc(50% - 15px);
            background: inherit;
            content: "";
            padding: 0px;
            transform: rotate(45deg);
            width: 15px;
            height: 15px;
            position: absolute;
            z-index: 99;
          }

          :global(.tick > path) {
            stroke: lightgray;
          }

          :global(.axis-labels) {
            fill: lightgray;
          }
          :global(.axis-baseline) {
            stroke-opacity: 0.25;
          }
          :global(circle.frame-hover) {
            fill: none;
            stroke: gray;
          }
        `}</style>
      </div>
    );

    this.setState({
      displayChart: {
        ...this.state.displayChart,
        [chartKey]: display
      },
      ...updatedState
    });
  };

  setGrid = () => {
    this.setState({ view: "grid" });
  };

  setLine = () => {
    this.updateChart({ view: "line" });
  };

  setBar = () => {
    this.updateChart({ view: "bar" });
  };

  setScatter = () => {
    this.updateChart({ view: "scatter" });
  };

  setHexbin = () => {
    this.updateChart({ view: "hexbin" });
  };

  setSummary = () => {
    this.updateChart({ view: "summary" });
  };

  setNetwork = () => {
    this.updateChart({ view: "network" });
  };

  setHierarchy = () => {
    this.updateChart({ view: "hierarchy" });
  };

  setLineType = (e: LineType) => {
    this.updateChart({ lineType: e });
  };

  updateDimensions = (e: string) => {
    const oldDims = this.state.selectedDimensions;
    const newDimensions =
      oldDims.indexOf(e) === -1
        ? [...oldDims, e]
        : oldDims.filter(d => d !== e);
    this.updateChart({ selectedDimensions: newDimensions });
  };
  updateMetrics = (e: string) => {
    const oldDims = this.state.selectedMetrics;
    const newMetrics =
      oldDims.indexOf(e) === -1
        ? [...oldDims, e]
        : oldDims.filter(d => d !== e);
    this.updateChart({ selectedMetrics: newMetrics });
  };

  render(): ?React$Element<any> {
    const {
      view,
      dimensions,
      metrics,
      chart,
      lineType,
      selectedDimensions,
      selectedMetrics,
      pieceType,
      summaryType,
      networkType,
      hierarchyType
    } = this.state;

    const { data, height } = this.props;
    const { primaryKey } = data.schema;

    let display = null;

    if (view === "grid") {
      display = <DataResourceTransformGrid {...this.props} />;
    } else if (
      [
        "line",
        "scatter",
        "bar",
        "network",
        "summary",
        "hierarchy",
        "hexbin"
      ].includes(view)
    ) {
      const { Frame, chartGenerator } = semioticSettings[view];

      const chartKey = generateChartKey({
        view,
        lineType,
        selectedDimensions,
        selectedMetrics,
        pieceType,
        summaryType,
        networkType,
        hierarchyType,
        chart
      });

      display = this.state.displayChart[chartKey];
    }

    return (
      <div>
        <MetadataWarning metadata={this.props.metadata} />
        <div
          style={{
            display: "flex",
            flexFlow: "row nowrap",
            width: "100%",
            height: this.props.height
          }}
        >
          <div
            style={{
              flex: "1"
            }}
          >
            {display}
          </div>
          <div
            style={{
              display: "flex",
              flexFlow: "column nowrap"
            }}
          >
            <IconButton onClick={this.setGrid} message={"Data Table"}>
              <DatabaseOcticon />
            </IconButton>
            <IconButton onClick={this.setBar} message={"Bar Graph"}>
              <BarChartIcon />
            </IconButton>
            <IconButton onClick={this.setSummary} message={"Summary"}>
              <BoxplotIcon />
            </IconButton>
            <IconButton onClick={this.setScatter} message={"Scatter Plot"}>
              <ScatterplotIcon />
            </IconButton>
            <IconButton onClick={this.setHexbin} message={"Area Plot"}>
              <HexbinIcon />
            </IconButton>
            <IconButton onClick={this.setNetwork} message={"Network"}>
              <NetworkIcon />
            </IconButton>
            <IconButton onClick={this.setHierarchy} message={"Hierarchy"}>
              <TreeIcon />
            </IconButton>
            <IconButton onClick={this.setLine} message={"Line Graph"}>
              <LineChartIcon />
            </IconButton>
          </div>
        </div>
      </div>
    );
  }
}

/////////////////////////////

type IconButtonProps = {
  message: string,
  onClick: () => void,
  children?: React.Node
};

export class IconButton extends React.Component<IconButtonProps> {
  render() {
    const { message, onClick, children } = this.props;
    return (
      <button
        onClick={onClick}
        key={message}
        title={message}
        style={{
          width: "32px",
          height: "32px"
        }}
      >
        {children}
      </button>
    );
  }
}

export default hot(module)(DataResourceTransform);
