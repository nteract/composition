import Immutable from 'immutable';
import * as constants from '../constants';

export default {
  [constants.SET_WIDGET_STATE]: function setWidgetState(documentState, action) {
    const { id, state } = action;
    return documentState.updateIn(['widgets', 'widgetModels', id], new Immutable.Map(),
      oldWidgetState => oldWidgetState.merge(Immutable.fromJS(state)));
  },

  [constants.DELETE_WIDGET]: function deleteWidget(state, action) {
    return state.deleteIn(['widgets', 'widgetModels', action.id]);
  },

  [constants.DISPLAY_WIDGET]: function displayWidget(state, action) {
    const { id, parentMsgId } = action;
    const cellId = state.getIn(['msgCellAssociations', parentMsgId]);
    return state.updateIn(['widgets', 'widgetViews', cellId], new Immutable.List(),
      views => views.push(id));
  },

  [constants.CLEAR_WIDGETS]: function clearWidgets(state, action) {
    const { id } = action;
    return state.setIn(['widgets', 'widgetViews', id], new Immutable.List());
  },
};
