import {
  take
} from 'redux-saga/effects';
import { unlink } from 'fs';

import { CLEANUP_KERNEL } from '../actions/constants';

export default function* cleanupKernel (getState) {
  while (true) {
    yield take(CLEANUP_KERNEL);

    // Get everything we need from state tree
    const state = getState();
    const channels = state.getIn(['kernel', 'channels']);
    const spawn = state.getIn(['kernel', 'spawn']);
    const connectionFile = state.getIn(['kernel', 'connectionFile']);

    // Shut everything down. Removing this stuff from actual state tree
    // is handled in the reducer for CLEANUP_KERNEL.
    if (channels) ['shell', 'iopub', 'stdin'].forEach(channel => channels[channel].complete());
    if (spawn) spawn.kill();
    if (connectionFile) unlink(connectionFile);
  }
}
