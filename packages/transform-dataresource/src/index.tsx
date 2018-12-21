import * as React from "react";

import { colors } from "./settings";
import { semioticSettings } from "./charts/settings";
import DataResourceTransformGrid from "./charts/grid";
import VizControls from "./VizControls";
import semioticStyle from "./css/semiotic";
import { Toolbar } from "./components/Toolbar";

const mediaType = "application/vnd.dataresource+json";

import * as Dx from "./types";
import {
  LineType,
  AreaType,
  PieceType,
  SummaryType,
  NetworkType,
  HierarchyType,
  Chart,
  View
} from "./types";

type dxMetaProps = {
  view?: View;
  lineType?: LineType;
  areaType?: AreaType;
  selectedDimensions?: string[];
  selectedMetrics?: string[];
  pieceType?: PieceType;
  summaryType?: SummaryType;
  networkType?: NetworkType;
  hierarchyType?: HierarchyType;
  colors?: string[];
  chart?: Chart;
};

type Metadata = {
  dx: dxMetaProps;
  sampled?: boolean;
};

type Props = {
  data: Dx.DataProps;
  metadata: Metadata;
  theme?: string;
  expanded?: boolean;
  height?: number;
  mediaType: "application/vnd.dataresource+json";
  initialView: View;
  onMetadataChange?: ({ dx }: { dx: dxMetaProps }) => void;
};

type State = {
  view: View;
  colors: string[];
  metrics: Dx.Field[];
  dimensions: Dx.Dimension[];
  selectedMetrics: string[];
  selectedDimensions: string[];
  networkType: NetworkType;
  hierarchyType: HierarchyType;
  pieceType: PieceType;
  summaryType: SummaryType;
  lineType: LineType;
  areaType: AreaType;
  chart: Chart;
  displayChart: DisplayChart;
  primaryKey: string[];
  data: Dx.Datapoint[];
};

const generateChartKey = ({
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
}: {
  view: View;
  lineType: LineType;
  areaType: AreaType;
  selectedDimensions: string[];
  selectedMetrics: string[];
  pieceType: PieceType;
  summaryType: SummaryType;
  networkType: NetworkType;
  hierarchyType: HierarchyType;
  chart: Chart;
}) =>
  `${view}-${lineType}-${areaType}-${selectedDimensions.join(
    ","
  )}-${selectedMetrics.join(
    ","
  )}-${pieceType}-${summaryType}-${networkType}-${hierarchyType}-${JSON.stringify(
    chart
  )}`;

type DisplayChart = {
  [chartKey: string]: React.ReactNode;
};
/*
  contour is an option for scatterplot
  pie is a transform on bar
*/

const MetadataWarning = ({ metadata }: { metadata: Metadata }) => {
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

class DataResourceTransform extends React.Component<Props, State> {
  static MIMETYPE = mediaType;

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

    const { dx: baseDX } = metadata;

    const { chart = {}, ...dx } = baseDX;

    const { fields = [], primaryKey = [] } = props.data.schema;

    const dimensions = fields.filter(
      field =>
        field.type === "string" ||
        field.type === "boolean" ||
        field.type === "datetime"
    ) as Dx.Dimension[];

    //Should datetime data types be transformed into js dates before getting to this resource?
    const data = props.data.data.map(datapoint => {
      const mappedDatapoint: Dx.Datapoint = {
        ...datapoint
      };
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
      .filter(
        field => !primaryKey.find(pkey => pkey === field.name)
      ) as Dx.Metric[];

    const displayChart: DisplayChart = {};
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
      // ui: {},
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
      displayChart,
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

  updateChart = (updatedState: Partial<State>) => {
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

    const display: React.ReactNode = (
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

    this.setState(
      (prevState): any => {
        return {
          ...updatedState,
          displayChart: {
            ...prevState.displayChart,
            [chartKey]: display
          }
        };
      }
    );
  };
  setView = (view: View) => {
    this.updateChart({ view });
  };

  setGrid = () => {
    this.setState({ view: "grid" });
  };

  setColor = (newColorArray: string[]) => {
    this.updateChart({ colors: newColorArray });
  };

  setLineType = (selectedLineType: LineType) => {
    this.updateChart({ lineType: selectedLineType });
  };

  setAreaType = (selectedAreaType: AreaType) => {
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
      areaType,
      selectedDimensions,
      selectedMetrics,
      pieceType,
      summaryType,
      networkType,
      hierarchyType
    } = this.state;

    let display: React.ReactNode = null;

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
        areaType,
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
