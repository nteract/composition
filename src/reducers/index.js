import { combineReducers } from 'redux-immutablejs';
import _notebook from './notebook';
import _kernel from './kernel';

export default (launchData) => combineReducers({
  notebook: _notebook(launchData),
  kernel: _kernel(launchData)
});
