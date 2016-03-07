import {
  take
} from 'redux-saga/effects';
import { unlink } from 'fs';

import { CLEANUP_KERNEL, KILL_KERNEL } from '../actions/constants';

export default function* cleanupKernel (getState) {
  while (true) {
    // Wait until we're being told to kill a kernel
    yield take(KILL_KERNEL);

    // Get everything we need from state tree
    const state = getState();
    const channels = state.getIn(['kernel', 'channels']);
    const spawn = state.getIn(['kernel', 'spawn']);
    const connectionFile = state.getIn(['kernel', 'connectionFile']);

    // Shut everything down.
    if (channels) ['shell', 'iopub', 'stdin'].forEach(subject => channels[subject].complete());
    if (spawn) spawn.kill();
    if (connectionFile) unlink(connectionFile);

    // Tell reducer to cleanup references to kernel in state:
    yield put({
      type: CLEANUP_KERNEL
    });
  }
}
