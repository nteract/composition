/**
 * Thus begins our path for custom mimetypes and future extensions
 */
import PlotlyTransform from '@nteract/transform-plotly';
import GeoJSONTransform from '@nteract/transform-geojson';

import ModelDebug from '@nteract/transform-model-debug';

import {
  VegaLite,
  Vega,
} from '@nteract/transform-vega';

import {
  standardTransforms,
  standardDisplayOrder,
  registerTransform,
  richestMimetype,
} from '@nteract/transforms';

const additionalTransforms = [
  ModelDebug,
  PlotlyTransform,
  GeoJSONTransform,
  VegaLite,
  Vega,
];

const {
  transforms,
  displayOrder,
} = additionalTransforms.reduce(registerTransform, {
  transforms: standardTransforms,
  displayOrder: standardDisplayOrder,
});

export {
  displayOrder,
  transforms,
  richestMimetype,
  registerTransform,
};
