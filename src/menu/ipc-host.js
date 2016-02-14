import { remote } from 'electron';
import * as actions from '../actions/index';

const ipcMain = remote.ipcMain;

export default function bindEvents(dispatch) {
  ipcMain.on('dispatch', (event, arg) => {
    dispatch(actions[arg.actionName].apply(null, arg.actionArgs));
  });
}
