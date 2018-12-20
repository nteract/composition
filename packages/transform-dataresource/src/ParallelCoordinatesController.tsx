import * as React from "react";
import { scaleLinear } from "d3-scale";
import { ResponsiveOrdinalFrame, Axis } from "semiotic";

import HTMLLegend from "./HTMLLegend";
import { numeralFormatting } from "./utilities";
import buttonGroupStyle from "./css/button-group";
import TooltipContent from "./tooltip-content";

import * as Dx from "Dx";
import { JSONObject } from "@nteract/commutable/src";

type State = {
  filterMode: boolean;
  data: Array<Object>;
  dataScales: { [index: string]: Function };
  columnExtent: { [index: string]: number[] };
};

type Props = {
  data: Dx.DataProps["data"];
  schema: Dx.DataProps["schema"];
  options: Dx.DataProps["options"];
};

const axisSize = [40, 380];

function parallelizeData(
  data: Dx.Datapoint[],
  metrics: { name: string }[],
  schemaFields: { name: string; type: string }[],
  primaryKey: string[]
) {
  const minmax: { [index: string]: Function } = {};
  const screenScales: { [index: string]: Function } = {};

  metrics.forEach(metric => {
    const dataExtent = [
      Math.min(...data.map(datapoint => datapoint[metric.name])),
      Math.max(...data.map(datapoint => datapoint[metric.name]))
    ];

    const minMaxScale = scaleLinear()
      .domain(dataExtent)
      .range([0, 1]);
    minmax[metric.name] = minMaxScale;

    const screenScale = scaleLinear()
      .domain(dataExtent)
      .range([380, 0]);

    screenScales[metric.name] = screenScale;
  });

  const dataPieces: Dx.Datapoint[] = [];
  data.forEach(datapoint => {
    metrics.forEach(metric => {
      const dataPiece: Dx.Datapoint = {
        metric: metric.name,
        rawvalue: datapoint[metric.name],
        pctvalue: minmax[metric.name](datapoint[metric.name])
      };
      schemaFields.forEach((field: { type: string; name: string }) => {
        if (field.type === "string")
          dataPiece[field.name] = datapoint[field.name];
      });
      primaryKey.forEach(key => {
        dataPiece[key] = datapoint[key];
      });
      dataPieces.push(dataPiece);
    });
  });

  return { dataPieces, scales: screenScales };
}

class ParallelCoordinatesController extends React.Component<Props, State> {
  static defaultProps = {
    metadata: {},
    height: 500
  };

  constructor(props: Props) {
    super(props);

    const { options, data, schema } = this.props;
    const { primaryKey } = options;

    const parallelizeResults = parallelizeData(
      data,
      options.metrics,
      schema.fields,
      primaryKey
    );

    this.state = {
      filterMode: true,
      data: parallelizeResults.dataPieces,
      dataScales: parallelizeResults.scales,
      columnExtent: options.metrics.reduce(
        (
          metricHash: { [index: string]: number[] },
          metric: { name: string }
        ) => {
          metricHash[metric.name] = [-Infinity, Infinity];
          return metricHash;
        },
        {}
      )
    };
  }

  shouldComponentUpdate(): boolean {
    return true;
  }

  brushing = (selectedExtent: Array<number>, columnName: string) => {
    const columnExtent = this.state.columnExtent;
    columnExtent[columnName] = selectedExtent;
    this.setState({ columnExtent });
  };

  render() {
    const { options, data } = this.props;

    const { primaryKey, metrics, chart, colors } = options;
    const { dim1 } = chart;

    const { columnExtent, filterMode } = this.state;

    const hiddenHash = new Map();

    const connectorFunction = (columnDatapoint: Dx.Datapoint) =>
      primaryKey.map(key => columnDatapoint[key]).join(",");

    Object.keys(columnExtent).forEach((key: string) => {
      const extent = columnExtent[key].sort((a, b) => a - b);
      this.state.data
        .filter(
          (datapoint: Dx.Datapoint) =>
            datapoint.metric === key &&
            (datapoint.pctvalue < extent[0] || datapoint.pctvalue > extent[1])
        )
        .forEach((datapoint: Dx.Datapoint) => {
          hiddenHash.set(primaryKey.map(key => datapoint[key]).join(","), true);
        });
    });

    const additionalSettings: {
      afterElements?: JSX.Element;
      annotations?: JSONObject[];
    } = {};

    const shownData = data.filter(
      datapoint =>
        !hiddenHash.get(primaryKey.map(key => datapoint[key]).join(","))
    );
    const filteredData = shownData.map(datapoint =>
      primaryKey.map(key => datapoint[key]).join(" - ")
    );

    const colorHash: { [index: string]: string } = { Other: "grey" };

    if (dim1 && dim1 !== "none") {
      const { uniqueValues, valueHash } = shownData.reduce(
        (valueReducer, datapoint) => {
          const value = datapoint[dim1];

          valueReducer.valueHash[value] =
            (valueReducer.valueHash[value] &&
              valueReducer.valueHash[value] + 1) ||
            1;

          valueReducer.uniqueValues =
            (!valueReducer.uniqueValues.find(
              (uniqueValue: string) => uniqueValue === value
            ) && [...valueReducer.uniqueValues, value]) ||
            valueReducer.uniqueValues;

          return valueReducer;
        },
        { uniqueValues: [], valueHash: {} }
      );

      const uniqueDimsForColors = data.reduce(
        (colorArray: Dx.Datapoint[], datapoint) =>
          colorArray.indexOf(datapoint[dim1]) === -1
            ? [...colorArray, datapoint[dim1]]
            : colorArray,
        []
      );

      uniqueDimsForColors.forEach((value: string, index: number) => {
        colorHash[value] = colors[index % colors.length];
      });

      additionalSettings.afterElements =
        uniqueValues.length <= 18 ? (
          <HTMLLegend
            values={uniqueValues}
            colorHash={colorHash}
            valueHash={valueHash}
          />
        ) : (
          <p style={{ margin: "20px 0 5px" }}>{filteredData.length} items</p>
        );
    }

    if (!filterMode)
      additionalSettings.annotations = metrics
        .map(metric => ({
          label: "",
          metric: metric.name,
          type: "enclose-rect",
          color: "green",
          disable: ["connector"],
          coordinates: [
            { metric: metric.name, pctvalue: columnExtent[metric.name][0] },
            { metric: metric.name, pctvalue: columnExtent[metric.name][1] }
          ]
        }))
        .filter(
          annotation =>
            annotation.coordinates[0].pctvalue !== 0 ||
            annotation.coordinates[1].pctvalue !== 1
        );

    return (
      <div>
        <div className="button-group">
          <button
            className={`button-text ${filterMode ? "selected" : ""}`}
            onClick={() => this.setState({ filterMode: true })}
          >
            Filter
          </button>
          <button
            className={`button-text ${filterMode ? "" : "selected"}`}
            onClick={() => this.setState({ filterMode: false })}
          >
            Explore
          </button>
        </div>
        <ResponsiveOrdinalFrame
          data={this.state.data}
          oAccessor="metric"
          rAccessor="pctvalue"
          type={{
            type: "point",
            r: 2
          }}
          connectorType={connectorFunction}
          style={(datapoint: Dx.Datapoint) => ({
            fill: hiddenHash.get(
              primaryKey.map((key: string) => datapoint[key]).join(",")
            )
              ? "lightgray"
              : colorHash[datapoint[dim1]],
            opacity: hiddenHash.get(
              primaryKey.map((key: string) => datapoint[key]).join(",")
            )
              ? 0.15
              : 0.99
          })}
          connectorStyle={(datapoint: Dx.Datapoint) => ({
            stroke: hiddenHash.get(
              primaryKey.map((key: string) => datapoint.source[key]).join(",")
            )
              ? "gray"
              : colorHash[datapoint.source[dim1]],
            strokeWidth: hiddenHash.get(
              primaryKey.map((key: string) => datapoint.source[key]).join(",")
            )
              ? 1
              : 1.5,
            strokeOpacity: hiddenHash.get(
              primaryKey.map((key: string) => datapoint.source[key]).join(",")
            )
              ? 0.1
              : 1
          })}
          responsiveWidth={true}
          margin={{ top: 20, left: 20, right: 20, bottom: 100 }}
          oPadding={40}
          pixelColumnWidth={80}
          interaction={
            filterMode
              ? {
                  columnsBrush: true,
                  during: this.brushing,
                  extent: Object.keys(this.state.columnExtent)
                }
              : null
          }
          pieceHoverAnnotation={!filterMode}
          tooltipContent={(hoveredDatapoint: Dx.Datapoint) => {
            const textColor = hiddenHash.get(
              primaryKey.map((key: string) => hoveredDatapoint[key]).join(",")
            )
              ? "grey"
              : colorHash[hoveredDatapoint[dim1]];
            return (
              <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
                <h3>
                  {primaryKey
                    .map((key: string) => hoveredDatapoint[key])
                    .join(", ")}
                </h3>
                {hoveredDatapoint[dim1] && (
                  <h3 style={{ color: textColor }}>
                    {dim1}: {hoveredDatapoint[dim1]}
                  </h3>
                )}
                <p>
                  {hoveredDatapoint.metric}: {hoveredDatapoint.rawvalue}
                </p>
              </TooltipContent>
            );
          }}
          canvasPieces={true}
          canvasConnectors={true}
          oLabel={(columnLabel: string) => (
            <g>
              <text transform="rotate(45)">{columnLabel}</text>
              <g transform="translate(-20,-395)">
                <Axis
                  scale={this.state.dataScales[columnLabel]}
                  size={axisSize}
                  orient="left"
                  ticks={5}
                  tickFormat={(tickValue: number) => (
                    <g>
                      <text
                        fill="white"
                        stroke="white"
                        opacity={0.75}
                        strokeWidth={2}
                        textAnchor="end"
                      >
                        {numeralFormatting(tickValue)}
                      </text>
                      <text textAnchor="end">
                        {numeralFormatting(tickValue)}
                      </text>
                    </g>
                  )}
                />
              </g>
            </g>
          )}
          {...additionalSettings}
        />
        <style jsx>{buttonGroupStyle}</style>
      </div>
    );
  }
}

export default ParallelCoordinatesController;
