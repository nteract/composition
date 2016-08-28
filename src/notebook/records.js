import Immutable from 'immutable';

export const WidgetsRecord = new Immutable.Record({
  widgetViews: new Immutable.Map(),
  widgetModels: new Immutable.Map(),
});

export const AppRecord = new Immutable.Record({
  executionState: 'not connected',
  github: null,
  channels: null,
  spawn: null,
  connectionFile: null,
  notificationSystem: null,
  kernelSpecName: null,
  isSaving: false,
  modified: false,
});

export const DocumentRecord = new Immutable.Record({
  notebook: null,
  cellPagers: new Immutable.Map(),
  cellStatuses: new Immutable.Map(),
  outputStatuses: new Immutable.Map(),
  stickyCells: new Immutable.Map(),
  focusedCell: null,
  cellMsgAssociations: new Immutable.Map(),
  msgCellAssociations: new Immutable.Map(),
  copied: new Immutable.Map(),
  widgets: new WidgetsRecord(),
});

export const MetadataRecord = new Immutable.Record({
  past: new Immutable.List(),
  future: new Immutable.List(),
  filename: '',
});
