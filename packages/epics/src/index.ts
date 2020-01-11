import { commListenEpic } from "./comm";
import {
  autoSaveCurrentContentEpic,
  fetchContentEpic,
  saveContentEpic,
  updateContentEpic,
  closeNotebookEpic
} from "./contents";
import {
  executeAllCellsEpic,
  executeCellAfterKernelLaunchEpic,
  executeCellEpic,
  executeFocusedCellEpic,
  sendExecuteRequestEpic,
  sendInputReplyEpic,
  updateDisplayEpic
} from "./execute";
import { publishToBookstore, publishToBookstoreAfterSave } from "./hosts";
import {
  acquireKernelInfoEpic,
  launchKernelWhenNotebookSetEpic,
  restartKernelEpic,
  watchExecutionStateEpic
} from "./kernel-lifecycle";
import { fetchKernelspecsEpic } from "./kernelspecs";
import {
  changeWebSocketKernelEpic,
  interruptKernelEpic,
  killKernelEpic,
  launchWebSocketKernelEpic,
  restartWebSocketKernelEpic
} from "./websocket-kernel";

// Because `@nteract/core` ends up being a commonjs import, we can't currently
// rely on `import { epics } from ""@nteract/core"`
// as it would collide the array with the named exports
const allEpics = [
  executeCellAfterKernelLaunchEpic,
  executeCellEpic,
  sendExecuteRequestEpic,
  updateDisplayEpic,
  executeAllCellsEpic,
  executeFocusedCellEpic,
  commListenEpic,
  launchWebSocketKernelEpic,
  changeWebSocketKernelEpic,
  interruptKernelEpic,
  killKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  restartKernelEpic,
  fetchKernelspecsEpic,
  fetchContentEpic,
  updateContentEpic,
  saveContentEpic,
  autoSaveCurrentContentEpic,
  publishToBookstore,
  publishToBookstoreAfterSave,
  restartWebSocketKernelEpic,
  sendInputReplyEpic,
  closeNotebookEpic
];

export {
  allEpics,
  executeCellAfterKernelLaunchEpic,
  executeCellEpic,
  sendExecuteRequestEpic,
  updateDisplayEpic,
  executeAllCellsEpic,
  executeFocusedCellEpic,
  commListenEpic,
  launchWebSocketKernelEpic,
  changeWebSocketKernelEpic,
  interruptKernelEpic,
  killKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  launchKernelWhenNotebookSetEpic,
  restartKernelEpic,
  fetchKernelspecsEpic,
  fetchContentEpic,
  updateContentEpic,
  saveContentEpic,
  autoSaveCurrentContentEpic,
  publishToBookstore,
  publishToBookstoreAfterSave,
  restartWebSocketKernelEpic,
  sendInputReplyEpic,
  closeNotebookEpic
};
