import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend';
import { shutdownRequest } from 'enchannel';
import { getUsername, session } from './messaging/index';

import * as fs from 'fs';
import * as uuid from 'uuid';
import { launch } from 'spawnteract';

export function launchKernel(kernelSpecName, spawnOptions) {
  return launch(kernelSpecName, spawnOptions)
      .then(c => {
        const kernelConfig = c.config;
        const spawn = c.spawn;
        const connectionFile = c.connectionFile;
        const identity = uuid.v4();
        const channels = {
          shell: createShellSubject(identity, kernelConfig),
          iopub: createIOPubSubject(identity, kernelConfig),
          control: createControlSubject(identity, kernelConfig),
          stdin: createStdinSubject(identity, kernelConfig),
        };
        return {
          channels,
          connectionFile,
          spawn,
        };
      });
}

function cleanupKernel(kernel, closeChannels) {
  if (kernel.channels && closeChannels) {
    try {
      kernel.channels.shell.complete();
      kernel.channels.iopub.complete();
      kernel.channels.stdin.complete();
      kernel.channels.control.complete();
    } catch (err) {
      // nom nom nom
      console.warn(`Could not cleanup kernel channels, have they already
        been completed?`, kernel.channels);
    }
  }

  if (kernel.spawn) {
    try {
      kernel.spawn.stdin.destroy();
      kernel.spawn.stdout.destroy();
      kernel.spawn.stderr.destroy();
    } catch (err) {
      // nom nom nom
      console.warn(`Could not cleanup kernel process stdio, have they already
        been destoryed?`, kernel.spawn);
    }
  }
  if (kernel.connectionFile) {
    fs.unlinkSync(kernel.connectionFile);
  }
}

export function forceShutdownKernel(kernel) {
  if (kernel && kernel.spawn && kernel.spawn.kill) {
    kernel.spawn.kill('SIGKILL');
  }

  cleanupKernel(kernel, true);

  // TODO: Refactor to either return a new blank kernel "reduction" or how we do this
  delete kernel.channels; // eslint-disable-line
  delete kernel.spawn; // eslint-disable-line
  delete kernel.connectionFile; // eslint-disable-line
}

export function shutdownKernel(kernel) {
  // Validate the input, do nothing if invalid kernel info is provided.
  if (!(kernel && (kernel.channels || kernel.spawn))) {
    return Promise.resolve();
  }

  // Fallback to forcefully shutting the kernel down.
  function handleShutdownFailure(err) {
    console.error(`Could not gracefully shutdown the kernel because of the
      following error.  nteract will now forcefully shutdown the kernel.`, err);
    forceShutdownKernel(kernel);
  }

  // Attempt to gracefully terminate the kernel.
  try {
    return shutdownRequest(kernel.channels, getUsername(), session, false).then(() => {
      // At this point, the kernel has cleaned up its resources.  Now we can
      // terminate the process and cleanup handles by calling forceShutdownKernel
      forceShutdownKernel(kernel);
    }).catch(handleShutdownFailure);
  } catch (err) {
    handleShutdownFailure(err);
    return Promise.reject(err);
  }
}
