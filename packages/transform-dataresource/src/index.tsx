/* @flow */
import * as React from "react";

import { colors } from "./settings";
import { semioticSettings } from "./charts/settings";
import DataResourceTransformGrid from "./charts/grid";
import VizControls from "./VizControls";
import semioticStyle from "./css/semiotic";
import { Toolbar } from "./components/Toolbar";

const mediaType = "application/vnd.dataresource+json";

type dataProps = {
  schema: {
    fields: Array<{ name: string; type: string }>;
    pandas_version: string;
    primaryKey: Array<string>;
  };
  data: Array<Object>;
};

type LineType = "line" | "stackedarea" | "bumparea" | "stackedpercent";

type AreaType = "hexbin" | "heatmap" | "contour";

type SummaryType = "violin" | "joy" | "histogram" | "heatmap" | "boxplot";

type PieceType = "bar" | "point" | "swarm" | "clusterbar";

type HierarchyType = "dendrogram" | "treemap" | "partition" | "sunburst";

type NetworkType = "force" | "sankey" | "arc" | "matrix";

import { View } from "./types";

type dxMetaProps = {
  view?: View;
  lineType?: LineType;
  areaType?: AreaType;
  selectedDimensions?: Array<string>;
  selectedMetrics?: Array<string>;
  pieceType?: PieceType;
  summaryType?: SummaryType;
  networkType?: NetworkType;
  hierarchyType?: HierarchyType;
  colors?: Array<string>;
  chart?: {
    metric1?: string;
    metric2?: string;
    metric3?: string;
    dim1?: string;
    dim2?: string;
    dim3?: string;
    networkLabel?: string;
    timeseriesSort?: string;
  };
};

type Props = {
  data: dataProps;
  metadata: { dx: dxMetaProps };
  theme?: string;
  expanded?: boolean;
  height?: number;
  mediaType: "application/vnd.dataresource+json";
  initialView: View;
  onMetadataChange?: ({ dx: dxMetaProps }) => void;
};

type State = {
  view: View;
  colors: Array<string>;
  metrics: Array<Object>;
  dimensions: Array<Object>;
  selectedMetrics: Array<string>;
  selectedDimensions: Array<string>;
  networkType: NetworkType;
  hierarchyType: HierarchyType;
  pieceType: PieceType;
  summaryType: SummaryType;
  lineType: LineType;
  areaType: AreaType;
  chart: Object;
  displayChart: Object;
  primaryKey: Array<string>;
  data: Array<Object>;
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
  static MIMETYPE = mediaType;

  //FOR TESTING PURPOSES ONLY THE METADATA HAS SAMPLE SETTINGS FOR A GRADUATED SYMBOL PLOT

  static defaultProps = {
    metadata: {
      dx: {}
    },
    height: 500,
    mediaType,
    initialView: "grid"
  };

  constructor(props: Props) {
    super(props);

    const { metadata, initialView } = props;

    const { dx: baseDX = {} } = metadata;

    const { chart = {}, ...dx } = baseDX;

    const { fields = [], primaryKey = [] } = props.data.schema;

    const dimensions = fields.filter(
      field =>
        field.type === "string" ||
        field.type === "boolean" ||
        field.type === "datetime"
    );

    //Should datetime data types be transformed into js dates before getting to this resource?
    const data = props.data.data.map(datapoint => {
      const mappedDatapoint = { ...datapoint };
      fields.forEach(field => {
        if (field.type === "datetime") {
          mappedDatapoint[field.name] = new Date(mappedDatapoint[field.name]);
        }
      });
      return mappedDatapoint;
    });

    const metrics = fields
      .filter(
        field =>
          field.type === "integer" ||
          field.type === "number" ||
          field.type === "datetime"
      )
      .filter(field => !primaryKey.find(pkey => pkey === field.name));

    this.state = {
      view: initialView,
      lineType: "line",
      areaType: "hexbin",
      selectedDimensions: [],
      selectedMetrics: [],
      pieceType: "bar",
      summaryType: "violin",
      networkType: "force",
      hierarchyType: "dendrogram",
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
        timeseriesSort: "array-order",
        networkLabel: "none",
        ...chart
      },
      displayChart: {},
      primaryKey,
      data,
      ...dx
    };
  }

  componentDidMount() {
    // This is necessary to render any charts based on passed metadata because the grid doesn't result from the updateChart function but any other view does
    if (this.state.view !== "grid") {
      this.updateChart(this.state);
    }
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

    const { data, height, onMetadataChange } = this.props;

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
      <div style={{ width: "calc(100vw - 200px)" }}>
        <Frame responsiveWidth={true} size={[500, 300]} {...frameSettings} />
        <VizControls
          {...{
            data: stateData,
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

    //If you pass an onMetadataChange function, then fire it and pass the updated dx settings so someone upstream can update the metadata or otherwise use it

    onMetadataChange &&
      onMetadataChange({
        ...this.props.metadata,
        dx: {
          view,
          lineType,
          areaType,
          selectedDimensions,
          selectedMetrics,
          pieceType,
          summaryType,
          networkType,
          hierarchyType,
          colors,
          chart
        }
      });

    this.setState(() => {
      return {
        ...updatedState,
        displayChart: {
          ...this.state.displayChart,
          [chartKey]: display
        }
      };
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

  setLineType = (selectedLineType: LineType) => {
    this.updateChart({ lineType: selectedLineType });
  };

  setAreaType = (selectedAreaType: LineType) => {
    this.updateChart({ areaType: selectedAreaType });
  };

  updateDimensions = (selectedDimension: string) => {
    const oldDims = this.state.selectedDimensions;
    const newDimensions =
      oldDims.indexOf(selectedDimension) === -1
        ? [...oldDims, selectedDimension]
        : oldDims.filter(dimension => dimension !== selectedDimension);
    this.updateChart({ selectedDimensions: newDimensions });
  };
  updateMetrics = (selectedMetric: string) => {
    const oldMetrics = this.state.selectedMetrics;
    const newMetrics =
      oldMetrics.indexOf(selectedMetric) === -1
        ? [...oldMetrics, selectedMetric]
        : oldMetrics.filter(metric => metric !== selectedMetric);
    this.updateChart({ selectedMetrics: newMetrics });
  };

  render() {
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
            width: "100%"
          }}
        >
          <div
            style={{
              flex: "1"
            }}
          >
            {display}
          </div>
          <Toolbar
            dimensions={dimensions}
            setGrid={this.setGrid}
            setView={this.setView}
            currentView={view}
          />
        </div>
      </div>
    );
  }
}

export default DataResourceTransform;
