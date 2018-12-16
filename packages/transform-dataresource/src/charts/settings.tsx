/* @flow */

import {
  ResponsiveOrdinalFrame,
  ResponsiveXYFrame,
  ResponsiveNetworkFrame
} from "semiotic";

import ParallelCoordinatesController from "../ParallelCoordinatesController";

import { semioticLineChart } from "./line";
import { semioticNetwork } from "./network";
import { semioticHierarchicalChart } from "./hierarchical";
import { semioticBarChart } from "./bar";
import { semioticScatterplot, semioticHexbin } from "./xyplot";
import { semioticSummaryChart } from "./summary";

import * as Dx from 'Dx'

const semioticParallelCoordinates = (
  data: Dx.Data,
  schema: Dx.Schema,
  options: Object
) => {
  return {
    data,
    schema,
    options
  };
};

export const semioticSettings: any = {
  line: {
    Frame: ResponsiveXYFrame,
    controls: "switch between linetype",
    chartGenerator: semioticLineChart
  },
  scatter: {
    Frame: ResponsiveXYFrame,
    controls: "switch between modes",
    chartGenerator: semioticScatterplot
  },
  hexbin: {
    Frame: ResponsiveXYFrame,
    controls: "switch between modes",
    chartGenerator: semioticHexbin
  },
  bar: {
    Frame: ResponsiveOrdinalFrame,
    controls: "switch between modes",
    chartGenerator: semioticBarChart
  },
  summary: {
    Frame: ResponsiveOrdinalFrame,
    controls: "switch between modes",
    chartGenerator: semioticSummaryChart
  },
  network: {
    Frame: ResponsiveNetworkFrame,
    controls: "switch between modes",
    chartGenerator: semioticNetwork
  },
  hierarchy: {
    Frame: ResponsiveNetworkFrame,
    controls: "switch between modes",
    chartGenerator: semioticHierarchicalChart
  },
  parallel: {
    Frame: ParallelCoordinatesController,
    controls: "switch between modes",
    chartGenerator: semioticParallelCoordinates
  }
};
