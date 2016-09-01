import { displayOrder, transforms } from 'transformime-react';

import VictoryTransform from './victory';

const defaultDisplayOrder = displayOrder.splice(0, 0, VictoryTransform.MIMETYPE);
const defaultTransforms = transforms.set(VictoryTransform.MIMETYPE, VictoryTransform);

export { defaultDisplayOrder, defaultTransforms };
