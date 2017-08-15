/* @flow */
import * as fs from "fs";

import type { Subject } from "rxjs";

import { shutdownRequest } from "../../../packages/enchannel";
import { getUsername, session } from "../../../packages/messaging";

export const filesystem = fs;

export type Channels = {
  iopub: Subject,
  stdin: Subject,
  shell: Subject,
  control: Subject
};

export type Kernel = {
  channels: Channels,
  spawn: any, // ChildProcess,
  connectionFile: string
};

export function cleanupKernel(kernel: Kernel, closeChannels: boolean): void {
  if (kernel.channels && closeChannels) {
    try {
      kernel.channels.shell.complete();
      kernel.channels.iopub.complete();
      kernel.channels.stdin.complete();
      kernel.channels.control.complete();
    } catch (err) {
      console.warn(
        `Could not cleanup kernel channels, have they already
        been completed?`,
        kernel.channels
      );
    }
  }

  if (kernel.spawn) {
    try {
      kernel.spawn.stdin.destroy();
      kernel.spawn.stdout.destroy();
      kernel.spawn.stderr.destroy();
    } catch (err) {
      // nom nom nom
      console.warn(
        `Could not cleanup kernel process stdio, have they already
        been destroyed?`,
        kernel.spawn
      );
    }
  }
  if (kernel.connectionFile) {
    filesystem.unlinkSync(kernel.connectionFile);
  }
}

export function forceShutdownKernel(kernel: Kernel): void {
  if (kernel && kernel.spawn && kernel.spawn.kill) {
    kernel.spawn.kill("SIGKILL");
  }

  cleanupKernel(kernel, true);
}

export function shutdownKernel(kernel: Kernel): Promise<boolean> {
  // Validate the input, do nothing if invalid kernel info is provided.
  if (!(kernel && (kernel.channels || kernel.spawn))) {
    return Promise.resolve(true);
  }

  // Fallback to forcefully shutting the kernel down.
  function handleShutdownFailure(err) {
    console.error(
      `Could not gracefully shutdown the kernel because of the
      following error.  nteract will now forcefully shutdown the kernel.`,
      err
    );
    forceShutdownKernel(kernel);
  }

  // Attempt to gracefully terminate the kernel.
  try {
    return shutdownRequest(kernel.channels, getUsername(), session, false)
      .then(() => {
        // At this point, the kernel has cleaned up its resources.  Now we can
        // terminate the process and cleanup handles by calling forceShutdownKernel
        forceShutdownKernel(kernel);
      })
      .catch(handleShutdownFailure);
  } catch (err) {
    handleShutdownFailure(err);
    return Promise.reject(err);
  }
}
