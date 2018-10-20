/**
 * Thus begins our path for custom mimetypes and future extensions
 */

import PlotlyTransform, {
  PlotlyNullTransform
} from "@nteract/transform-plotly";
import GeoJSONTransform from "@nteract/transform-geojson";

import ModelDebug from "@nteract/transform-model-debug";

import DataResourceTransform from "@nteract/transform-dataresource";

import { VegaLite1, VegaLite2, Vega2, Vega3 } from "@nteract/transform-vega";
import { WidgetDisplay } from "@nteract/jupyter-widgets";

import {
  standardTransforms,
  standardDisplayOrder,
  registerTransform,
  richestMimetype
} from "@nteract/transforms";

const additionalTransforms = [
  WidgetDisplay,
  DataResourceTransform,
  ModelDebug,
  PlotlyNullTransform,
  PlotlyTransform,
  GeoJSONTransform,
  VegaLite1,
  VegaLite2,
  Vega2,
  Vega3
];

const { transforms, displayOrder } = additionalTransforms.reduce(
  registerTransform,
  {
    transforms: standardTransforms,
    displayOrder: standardDisplayOrder
  }
);

export { displayOrder, transforms, richestMimetype, registerTransform };
