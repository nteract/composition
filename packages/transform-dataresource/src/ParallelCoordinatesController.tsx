/* @flow */

import * as React from "react";
import { scaleLinear } from "d3-scale";
import { ResponsiveOrdinalFrame, Axis } from "semiotic";

import HTMLLegend from "./HTMLLegend";
import { numeralFormatting } from "./utilities";
import buttonGroupStyle from "./css/button-group";
import TooltipContent from "./tooltip-content";

type State = {
  filterMode: boolean,
  data: Array<Object>,
  dataScales: Object,
  columnExtent: Object
};

type Props = {
  data: Array<Object>,
  schema: Object,
  options: Object
};

const axisSize = [40, 380];

function parallelizeData(data, metrics, schemaFields, primaryKey) {
  const minmax = {};
  const screenScales = {};

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

  const dataPieces = [];
  data.forEach(datapoint => {
    metrics.forEach(metric => {
      const dataPiece = {
        metric: metric.name,
        rawvalue: datapoint[metric.name],
        pctvalue: minmax[metric.name](datapoint[metric.name])
      };
      schemaFields.forEach(field => {
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
      columnExtent: options.metrics.reduce((metricHash, metric) => {
        metricHash[metric.name] = undefined;
        return metricHash;
      }, {})
    };
  }

  shouldComponentUpdate(): boolean {
    return true;
  }

  brushing = (selectedExtent: Array<number>, columnName: string) => {
    const columnExtent = this.state.columnExtent;
    columnExtent[columnName] = selectedExtent;
    this.setState(columnExtent);
  };

  render(): ?React$Element<any> {
    const { options, data } = this.props;

    const { primaryKey, metrics, chart, colors } = options;
    const { dim1 } = chart;

    const { columnExtent, filterMode } = this.state;

    const hiddenHash = new Map();

    const connectorFunction = columnDatapoint =>
      primaryKey.map(key => columnDatapoint[key]).join(",");

    Object.keys(columnExtent).forEach(key => {
      if (columnExtent[key]) {
        const extent = columnExtent[key].sort((a, b) => a - b);
        this.state.data
          .filter(
            datapoint =>
              datapoint.metric === key &&
              (datapoint.pctvalue < extent[0] || datapoint.pctvalue > extent[1])
          )
          .forEach(datapoint => {
            hiddenHash.set(
              primaryKey.map(key => datapoint[key]).join(","),
              true
            );
          });
      }
    });

    const additionalSettings = {};

    const shownData = data.filter(
      datapoint =>
        !hiddenHash.get(primaryKey.map(key => datapoint[key]).join(","))
    );
    const filteredData = shownData.map(datapoint =>
      primaryKey.map(key => datapoint[key]).join(" - ")
    );

    const colorHash = { Other: "grey" };

    if (dim1 && dim1 !== "none") {
      const { uniqueValues, valueHash } = shownData.reduce(
        (valueReducer, datapoint) => {
          const value = datapoint[dim1];

          valueReducer.valueHash[value] =
            (valueReducer.valueHash[value] &&
              valueReducer.valueHash[value] + 1) ||
            1;

          valueReducer.uniqueValues =
            (!valueReducer.uniqueValues.find(d => d === value) && [
              ...valueReducer.uniqueValues,
              value
            ]) ||
            valueReducer.uniqueValues;

          return valueReducer;
        },
        { uniqueValues: [], valueHash: {} }
      );

      const uniqueDimsForColors = data.reduce(
        (colorArray, datapoint) =>
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
          style={datapoint => ({
            fill: hiddenHash.get(
              primaryKey.map(key => datapoint[key]).join(",")
            )
              ? "lightgray"
              : colorHash[datapoint[dim1]],
            opacity: hiddenHash.get(
              primaryKey.map(key => datapoint[key]).join(",")
            )
              ? 0.15
              : 0.99
          })}
          connectorStyle={datapoint => ({
            stroke: hiddenHash.get(
              primaryKey.map(key => datapoint.source[key]).join(",")
            )
              ? "gray"
              : colorHash[datapoint.source[dim1]],
            strokeWidth: hiddenHash.get(
              primaryKey.map(key => datapoint.source[key]).join(",")
            )
              ? 1
              : 1.5,
            strokeOpacity: hiddenHash.get(
              primaryKey.map(key => datapoint.source[key]).join(",")
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
          tooltipContent={hoveredDatapoint => {
            const textColor = hiddenHash.get(
              primaryKey.map(key => hoveredDatapoint[key]).join(",")
            )
              ? "grey"
              : colorHash[hoveredDatapoint[dim1]];
            return (
              <TooltipContent x={hoveredDatapoint.x} y={hoveredDatapoint.y}>
                <h3>
                  {primaryKey.map(key => hoveredDatapoint[key]).join(", ")}
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
          oLabel={columnLabel => (
            <g>
              <text transform="rotate(45)">{columnLabel}</text>
              <g transform="translate(-20,-395)">
                <Axis
                  scale={this.state.dataScales[columnLabel]}
                  size={axisSize}
                  orient="left"
                  ticks={5}
                  tickFormat={tickValue => (
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
