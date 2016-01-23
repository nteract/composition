import Rx from 'rx';

import { getJSON } from '../api';

export const actions = new Rx.Subject();

import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend';

import * as uuid from 'uuid';
import { launch } from 'spawnteract';

export const readJSON = (filePath) =>
  Rx.Observable.fromPromise(getJSON(filePath))
    .subscribe(data => actions.onNext(Object.assign({},
                                      { type: 'READ_JSON' },
                                      { data })));

export const updateCell = (notebook, index, cell) =>
  actions.onNext(Object.assign({}, { type: 'UPDATE_CELL' }, { notebook, index, cell }));

export const launchKernel = (kernelSpecName) =>
  launch(kernelSpecName)
    .then(c => {
      debugger;
      const kernel = c.config;
      const spawn = c.spawn;
      const connectionFile = c.connFile;
      const identity = uuid.v4();
      console.log(identity);
      console.log(connectionFile);
      const channels = {
        shell: createShellSubject(identity, kernel),
        iopub: createIOPubSubject(identity, kernel),
        control: createControlSubject(identity, kernel),
        stdin: createStdinSubject(identity, kernel),
      };
      actions.onNext(Object.assign({},
        { type: 'LAUNCH_KERNEL' },
        { channels, connectionFile, spawn }
      ));
    });
