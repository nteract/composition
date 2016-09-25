import { handleActions } from 'redux-actions';

import * as constants from '../constants';

export default handleActions({
  // No one is using this --> we merely need a consistent structure
  [constants.REGISTER_COMM_TARGET]: function registerCommTarget(state, action) {
    return state.setIn(['targets', action.name], action.handler);
  },
  [constants.MODEL_CREATE]: function createModel(state, action) {
    const { id, targetName, targetModule } = action;
    return state.setIn(['models', id, 'reducer'],
            state.getIn(['modelReducers'], target));
  },
  [constants.MODEL_UPDATE]: function updateModel(state, action) {
    const id = action.modelID;
    const model = state.getIn(['models', id]);
    return state.setIn(['models', id, 'state'],
      model.reducer(model.state, action.update, models));
  },
}, {});
