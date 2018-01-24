// @flow
import {
  fetchKernelspecsEpic,
  fetchContentEpic,
  setNotebookEpic,
  executeCellEpic,
  updateDisplayEpic,
  commListenEpic,
  launchWebSocketKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic
} from "@nteract/core/epics";

// TODO: Bring desktop's wrapEpic over to @nteract/core so we can use it here
const epics = [
  fetchKernelspecsEpic,
  executeCellEpic,
  updateDisplayEpic,
  commListenEpic,
  launchWebSocketKernelEpic,
  fetchContentEpic,
  setNotebookEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic
];

export default epics;
