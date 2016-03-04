import {
  take,
  put,
  call
} from 'redux-saga/effects';
import { NEW_KERNEL } from '../actions/constants';
import { launchKernel } from '../api/kernel';

import { addKernel } from '../actions';

export default function* newKernel(getState) {
  while (true) {
    const { kernelSpecName } = yield take(NEW_KERNEL);

    try {
      // Spawn a kernel
      const kc = yield call(launchKernel, kernelSpecName);
      const { channels, connectionFile, spawn } = kc;

      // And put it in store
      yield put(addKernel({
        channels,
        connectionFile,
        spawn
      }))
    } catch (error) {
      console.error(error);
    }
  }
}
