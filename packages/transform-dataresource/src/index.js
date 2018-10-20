/* @flow */
import { hot } from "react-hot-loader";

import * as React from "react";
import { DatabaseOcticon } from "@nteract/octicons";

import { colors } from "./settings";
import { semioticSettings } from "./charts/settings";
import { DataResourceTransformGrid } from "./charts/grid";
import VizControls from "./VizControls";
import semioticStyle from "./css/semiotic";

import {
  TreeIcon,
  NetworkIcon,
  BoxplotIcon,
  ScatterplotIcon,
  LineChartIcon,
  BarChartIcon,
  HexbinIcon,
  ParallelCoordinatesIcon
} from "./icons";

import { chartHelpText } from "./docs/chart-docs";

type Props = {
  data: Object,
  metadata: Object,
  theme?: string,
  expanded?: boolean,
  height?: number
};

type LineType = "line" | "stackedarea" | "bumparea" | "stackedpercent";

type State = {
  view:
    | "line"
    | "bar"
    | "scatter"
    | "grid"
    | "network"
    | "summary"
    | "hexbin"
    | "parallel"
    | "hierarchy",
  colors: Array<string>,
  metrics: Array<Object>,
  dimensions: Array<Object>,
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
  displayChart: Object,
  primaryKey: Array<string>,
  data: Array<Object>
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

    const { fields = [], primaryKey = [] } = props.data.schema;

    const dimensions = fields.filter(
      d => d.type === "string" || d.type === "boolean" || d.type === "datetime"
    );

    //Should datetime data types be transformed into js dates before getting to this resource?
    const data = props.data.data.map(d => {
      const mappedD = { ...d };
      fields.forEach(p => {
        if (p.type === "datetime") {
          mappedD[p.name] = new Date(mappedD[p.name]);
        }
      });
      return mappedD;
    });

    const metrics = fields
      .filter(
        d =>
          d.type === "integer" || d.type === "number" || d.type === "datetime"
      )
      .filter(d => !primaryKey.find(p => p === d.name));

    this.state = {
      view: "grid",
      lineType: "line",
      areaType: "hexbin",
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
      colors,
      ui: {},
      chart: {
        metric1: (metrics[0] && metrics[0].name) || "none",
        metric2: (metrics[1] && metrics[1].name) || "none",
        metric3: "none",
        dim1: (dimensions[0] && dimensions[0].name) || "none",
        dim2: (dimensions[1] && dimensions[1].name) || "none",
        dim3: "none",
        timeseriesSort: "array-order"
      },
      displayChart: {},
      primaryKey,
      data
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
      areaType,
      selectedDimensions,
      selectedMetrics,
      pieceType,
      summaryType,
      networkType,
      hierarchyType,
      colors,
      primaryKey,
      data: stateData
    } = { ...this.state, ...updatedState };

    const { data, height = 500 } = this.props;

    const { Frame, chartGenerator } = semioticSettings[view];

    const chartKey = generateChartKey({
      view,
      lineType,
      areaType,
      selectedDimensions,
      selectedMetrics,
      pieceType,
      summaryType,
      networkType,
      hierarchyType,
      chart
    });

    const frameSettings = chartGenerator(stateData, data.schema, {
      metrics,
      dimensions,
      chart,
      colors,
      height,
      lineType,
      areaType,
      selectedDimensions,
      selectedMetrics,
      pieceType,
      summaryType,
      networkType,
      hierarchyType,
      primaryKey,
      setColor: this.setColor
    });

    const display = (
      <div style={{ marginLeft: "50px", width: "calc(100vw - 200px)" }}>
        <Frame
          responsiveWidth={true}
          size={[500, height - 200]}
          {...frameSettings}
        />
        <VizControls
          {...{
            view,
            chart,
            metrics,
            dimensions,
            selectedDimensions,
            selectedMetrics,
            hierarchyType,
            summaryType,
            networkType,
            updateChart: this.updateChart,
            updateDimensions: this.updateDimensions,
            setLineType: this.setLineType,
            updateMetrics: this.updateMetrics,
            lineType,
            setAreaType: this.setAreaType,
            areaType
          }}
        />
        <style jsx>{semioticStyle}</style>
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
  setView = view => {
    this.updateChart({ view });
  };

  setGrid = () => {
    this.setState({ view: "grid" });
  };

  setColor = newColorArray => {
    this.updateChart({ colors: newColorArray });
  };

  setLineType = (e: LineType) => {
    this.updateChart({ lineType: e });
  };

  setAreaType = (e: LineType) => {
    this.updateChart({ areaType: e });
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
      chart,
      lineType,
      selectedDimensions,
      selectedMetrics,
      pieceType,
      summaryType,
      networkType,
      hierarchyType
    } = this.state;

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
        "hexbin",
        "parallel"
      ].includes(view)
    ) {
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
              flexFlow: "column nowrap",
              zIndex: 1,
              padding: "5px",
              background: "white"
            }}
          >
            <IconButton
              title={chartHelpText.grid}
              onClick={this.setGrid}
              message={"Data Table"}
              selected={false}
            >
              <DatabaseOcticon />
            </IconButton>
            {dimensions.length > 0 && (
              <IconButton
                title={chartHelpText.bar}
                onClick={() => this.setView("bar")}
                selected={view === "bar"}
                message={"Bar Graph"}
              >
                <BarChartIcon />
              </IconButton>
            )}
            <IconButton
              title={chartHelpText.summary}
              onClick={() => this.setView("summary")}
              selected={view === "summary"}
              message={"Summary"}
            >
              <BoxplotIcon />
            </IconButton>
            <IconButton
              title={chartHelpText.scatter}
              onClick={() => this.setView("scatter")}
              selected={view === "scatter"}
              message={"Scatter Plot"}
            >
              <ScatterplotIcon />
            </IconButton>
            <IconButton
              title={chartHelpText.hexbin}
              onClick={() => this.setView("hexbin")}
              selected={view === "hexbin"}
              message={"Area Plot"}
            >
              <HexbinIcon />
            </IconButton>
            {dimensions.length > 1 && (
              <IconButton
                title={chartHelpText.network}
                onClick={() => this.setView("network")}
                selected={view === "network"}
                message={"Network"}
              >
                <NetworkIcon />
              </IconButton>
            )}
            {dimensions.length > 0 && (
              <IconButton
                title={chartHelpText.hierarchy}
                onClick={() => this.setView("hierarchy")}
                selected={view === "hierarchy"}
                message={"Hierarchy"}
              >
                <TreeIcon />
              </IconButton>
            )}
            {dimensions.length > 0 && (
              <IconButton
                title={chartHelpText.parallel}
                onClick={() => this.setView("parallel")}
                selected={view === "parallel"}
                message={"Parallel Coordinates"}
              >
                <ParallelCoordinatesIcon />
              </IconButton>
            )}
            <IconButton
              title={chartHelpText.line}
              onClick={() => this.setView("line")}
              selected={view === "line"}
              message={"Line Graph"}
            >
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
  children?: React.Node,
  title: string,
  selected: boolean
};

export class IconButton extends React.Component<IconButtonProps> {
  render() {
    const {
      message,
      onClick,
      children,
      selected,
      title = message
    } = this.props;

    let style: Object = {
      width: "32px",
      height: "32px",
      cursor: "pointer"
    };
    if (selected) {
      style.border = "1px outset #666";
      style.backgroundColor = "#aaa";
    }

    return (
      <button onClick={onClick} key={message} title={title} style={style}>
        {children}
      </button>
    );
  }
}

export default hot(module)(DataResourceTransform);
