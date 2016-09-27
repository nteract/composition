import { displayOrder, transforms } from 'transformime-react';

/**
 * Thus begins our path for custom mimetypes and future extensions
 */

import PlotlyTransform from './plotly';
import GeoJSONTransform from './geojson';
import HokeyTransform from './hokey-pokey';

// Register custom transforms
const defaultTransforms = transforms
  .set(HokeyTransform.MIMETYPE, HokeyTransform)
  .set(PlotlyTransform.MIMETYPE, PlotlyTransform)
  .set(GeoJSONTransform.MIMETYPE, GeoJSONTransform);

// Register our custom transforms as the most rich (front of List)
const defaultDisplayOrder = displayOrder
  .insert(0, HokeyTransform.MIMETYPE)
  .insert(0, PlotlyTransform.MIMETYPE)
  .insert(0, GeoJSONTransform.MIMETYPE);

export { defaultDisplayOrder, defaultTransforms };
