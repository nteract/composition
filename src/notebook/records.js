import Immutable from 'immutable';

const Github = require('github');

export const AppRecord = new Immutable.Record({
  executionState: 'not connected',
  token: null,
  channels: null,
  spawn: null,
  connectionFile: null,
  notificationSystem: null,
  kernelSpecName: null,
  isSaving: false,
  lastSaved: null,
  configLastSaved: null,
  error: null,
});

export const DocumentRecord = new Immutable.Record({
  notebook: null,
  cellPagers: new Immutable.Map(),
  outputStatuses: new Immutable.Map(),
  stickyCells: new Immutable.Set(),
  editorFocused: null,
  cellFocused: null,
  copied: new Immutable.Map(),
});

export const MetadataRecord = new Immutable.Record({
  past: new Immutable.List(),
  future: new Immutable.List(),
  filename: '',
});

export const CommsRecord = new Immutable.Record({
  targets: new Immutable.Map(),
});
