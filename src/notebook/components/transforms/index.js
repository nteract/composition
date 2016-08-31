import { displayOrder, transforms } from 'transformime-react';

import VictoryTransform from './victory';
import PlotlyTransform from './plotly';
import VegaTransform from './vega';

const defaultDisplayOrder = displayOrder
  .splice(0, 0, VegaTransform.MIMETYPE)
  .splice(0, 0, VictoryTransform.MIMETYPE)
  .splice(0, 0, PlotlyTransform.MIMETYPE);

const defaultTransforms = transforms
  .set(VegaTransform.MIMETYPE, VegaTransform)
  .set(VictoryTransform.MIMETYPE, VictoryTransform)
  .set(PlotlyTransform.MIMETYPE, PlotlyTransform);

export { defaultDisplayOrder, defaultTransforms };
