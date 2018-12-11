import * as React from "react";
import { DatabaseOcticon } from "@nteract/octicons";

import { chartHelpText } from "../docs/chart-docs";
import {
  TreeIcon,
  NetworkIcon,
  BoxplotIcon,
  ScatterplotIcon,
  LineChartIcon,
  BarChartIcon,
  HexbinIcon,
  ParallelCoordinatesIcon
} from "../icons";

import { View } from "../types";

import { IconButton } from "./IconButton";

type Props = {
  setGrid: () => void;
  dimensions: Array<Object>;
  setView: (view: View) => void;
  currentView: string;
};

export const Toolbar = ({
  dimensions,
  setGrid,
  setView,
  currentView
}: Props) => {
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column nowrap",
        zIndex: 1,
        padding: "5px"
      }}
      className="dx-button-bar"
    >
      <IconButton
        title={chartHelpText.grid}
        onClick={setGrid}
        message={"Data Table"}
        selected={false}
      >
        <DatabaseOcticon />
      </IconButton>
      {dimensions.length > 0 && (
        <IconButton
          title={chartHelpText.bar}
          onClick={() => setView("bar")}
          selected={currentView === "bar"}
          message={"Bar Graph"}
        >
          <BarChartIcon />
        </IconButton>
      )}
      <IconButton
        title={chartHelpText.summary}
        onClick={() => setView("summary")}
        selected={currentView === "summary"}
        message={"Summary"}
      >
        <BoxplotIcon />
      </IconButton>
      <IconButton
        title={chartHelpText.scatter}
        onClick={() => setView("scatter")}
        selected={currentView === "scatter"}
        message={"Scatter Plot"}
      >
        <ScatterplotIcon />
      </IconButton>
      <IconButton
        title={chartHelpText.hexbin}
        onClick={() => setView("hexbin")}
        selected={currentView === "hexbin"}
        message={"Area Plot"}
      >
        <HexbinIcon />
      </IconButton>
      {dimensions.length > 1 && (
        <IconButton
          title={chartHelpText.network}
          onClick={() => setView("network")}
          selected={currentView === "network"}
          message={"Network"}
        >
          <NetworkIcon />
        </IconButton>
      )}
      {dimensions.length > 0 && (
        <IconButton
          title={chartHelpText.hierarchy}
          onClick={() => setView("hierarchy")}
          selected={currentView === "hierarchy"}
          message={"Hierarchy"}
        >
          <TreeIcon />
        </IconButton>
      )}
      {dimensions.length > 0 && (
        <IconButton
          title={chartHelpText.parallel}
          onClick={() => setView("parallel")}
          selected={currentView === "parallel"}
          message={"Parallel Coordinates"}
        >
          <ParallelCoordinatesIcon />
        </IconButton>
      )}
      <IconButton
        title={chartHelpText.line}
        onClick={() => setView("line")}
        selected={currentView === "line"}
        message={"Line Graph"}
      >
        <LineChartIcon />
      </IconButton>
    </div>
  );
};
