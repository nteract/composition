
import { ipcMain } from 'electron';
import { Menu } from 'menu';
import { List } from 'immutable';

// Export the default menu as a const.
import defaultMenu from './default';
export const DEFAULT_MENU = defaultMenu;

/**
 * Dispatch a menu action
 * @param  {Object|string} action   Action that should be dispatched
 * @return {undefined}
 */
function dispatchAction(action) {
  const isString = (typeof action === 'string');
  const actionName = isString ? action : action.get('name');
  const actionArgs = isString ? [] : action.get('args', new List()).toJS();
  ipcMain.send('dispatch', { actionName, actionArgs });
}

/**
 * Creates a menu template object from an immutable menu.
 * @param  {Immutable.Map} immutableMenu   menu definition
 * @return {object}        template        menu template object compatable with
 *                                         electron's menu API
 */
export function createMenuTemplate(immutableMenu) {
  if (!immutableMenu) {
    return immutableMenu;
  }

  if (List.isList(immutableMenu)) {
    return immutableMenu.map(x => createMenuTemplate(x)).toJS();
  }

  return immutableMenu
    .update('click', cb => cb ? cb : () => {
      const action = immutableMenu.get('action');
      if (List.isList(action)) {
        action.map(x => dispatchAction(x));
      } else if (action) {
        dispatchAction(action);
      }
    })
    .update('submenu', submenu => createMenuTemplate(submenu))
    .toJS();
}

/**
 * Sets the application menu
 * @param  {Map|Promise<Map>} asyncMenu  menu definition
 * @return {undefined}
 */
export function setApplicationMenu(asyncMenu) {
  Promise.resolve(asyncMenu).then(menu => {
    const builtMenu = Menu.buildFromTemplate(createMenuTemplate(menu));
    Menu.setApplicationMenu(builtMenu);
  });
}
