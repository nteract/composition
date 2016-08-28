import { WidgetManager } from './manager';

const ACTION_NAME = 'WIDGETS';
let manager_instance;
module.exports = {

  ACTION_NAME,
  CREATE_ACTION: { type: ACTION_NAME },

  createWidgetManagerEpic: (actions$, store) => {
    manager_instance = new WidgetManager(actions$, store);
    return actions$.filter(() => false);
  },

  widgetManager: () => manager_instance,
};
