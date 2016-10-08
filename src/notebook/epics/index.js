import {
  saveEpic,
  saveAsEpic,
} from './saving';

import {
  loadEpic,
  newNotebookEpic,
} from './loading';

import {
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
} from './kernel-launch';

import {
  executeCellEpic,
} from './execute';

import {
  publishEpic,
} from './github-publish';

import {
  commListenEpic,
} from './comm';

import {
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic,
} from './config';

import {
  condaKernelsEpic,
} from './conda-kernel-provider-epic';

const epics = [
  commListenEpic,
  condaKernelsEpic,
  publishEpic,
  saveEpic,
  saveAsEpic,
  loadEpic,
  newNotebookEpic,
  executeCellEpic,
  newKernelEpic,
  acquireKernelInfoEpic,
  watchExecutionStateEpic,
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic,
];

export default epics;
