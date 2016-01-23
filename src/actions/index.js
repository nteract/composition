import Rx from 'rx';

import { getJSON } from '../api';

export const actions = new Rx.Subject();

import { createShellSubject, createIOPubSubject } from 'enchannel-zmq-backend';

import * as uuid from 'uuid';
import { launch } from 'spawnteract';

export const readJSON = (filePath) =>
  Rx.Observable.fromPromise(getJSON(filePath))
    .subscribe(data => actions.onNext(Object.assign({},
                                      { type: 'READ_JSON' },
                                      { data })));

export const updateCell = (notebook, index, cell) =>
  actions.onNext(Object.assign({}, { type: 'UPDATE_CELL' }, { notebook, index, cell }));

export const launchKernel = (kernelSpecName) => {
  return launch(kernelSpecName)
    .then(c => {
      const kernel = c.config;
      const spawn = c.spawn;
      const connectionFile = c.connFile;
      const identity = uuid.v4();
      const channels = {
        shell: createShellSubject(identity, kernel),
        iopub: createIOPubSubject(identity, kernel),
      };
      actions.onNext(Object.assign({},
        { type: 'LAUNCH_KERNEL' },
        { channels, connectionFile, spawn }
      ));
    });
};
