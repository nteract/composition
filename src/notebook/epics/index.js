import {
  saveEpic,
  saveAsEpic,
} from './saving';

import {
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  newNotebookKernelEpic,
} from './kernelLaunch';

import {
  executeCellEpic,
} from './execute';

import {
  createWidgetManagerEpic,
} from '../widgets';

const epics = [
  saveEpic,
  saveAsEpic,
  executeCellEpic,
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  newNotebookKernelEpic,
  createWidgetManagerEpic,
];

export default epics;
