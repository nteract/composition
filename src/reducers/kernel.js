import createReducer from '../utils/createReducer';
import { fromJS } from 'immutable';
import {
  ADD_KERNEL,
  ERROR_KERNEL_NOT_CONNECTED,
  CLEANUP_KERNEL
} from '../actions/constants';

const initialState = fromJS({});

export default () => createReducer({
  [ADD_KERNEL]: (state, { channels, connectionFile, spawn }) => state.merge({
    channels,
    connectionFile,
    spawn
  }),
  [ERROR_KERNEL_NOT_CONNECTED]: (state) => state.set(
    'error',
    'Error: We\'re not connected to a runtime!'
  ),
  [CLEANUP_KERNEL]: (state) => state
    .remove('channels')
    .remove('connectionFile')
    .remove('spawn')
}, initialState);
