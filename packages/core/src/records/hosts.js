// @flow
import type { ChildProcess } from "child_process";
import type { Id } from "./ids";
import type { RecordFactory, RecordOf } from "immutable";
import type { HostRef, KernelRef, KernelspecsRef } from "./refs";

import { Record, List } from "immutable";

export type BaseHostProps = {
  id: ?Id,
  ref: ?HostRef,
  selectedKernelRef: ?KernelRef,
  kernelspecsRef: ?KernelspecsRef, // reference to a collection of kernelspecs
  defaultKernelName: ?string,
  // In the desktop case, this _should_ be only one, pending
  // kernel cleanup
  activeKernelRefs: List<Id>
};

export type JupyterHostRecordProps = BaseHostProps & {
  type: "jupyter",
  token: ?string,
  serverUrl: ?string,
  crossDomain: ?boolean
};

export const makeJupyterHostRecord: RecordFactory<
  JupyterHostRecordProps
> = Record({
  type: "jupyter",
  ref: null,
  id: null,
  selectedKernelRef: null,
  kernelspecsRef: null,
  defaultKernelName: null,
  activeKernelRefs: List(),
  token: null,
  serverUrl: null,
  crossDomain: false
});

export type JupyterHostRecord = RecordOf<JupyterHostRecordProps>;

export type BinderHostRecordProps = JupyterHostRecordProps & {
  // TODO: figure out if this belong here, it was brought over by play
  messages: List<string>
};

export type DesktopHostRecordProps = BaseHostProps & {
  type: "local"
};

export const makeDesktopHostRecord: RecordFactory<
  DesktopHostRecordProps
> = Record({
  type: "local",
  ref: null,
  id: null,
  selectedKernelRef: null,
  kernelspecsRef: null,
  defaultKernelName: null,
  activeKernelRefs: List()
});

export type DesktopHostRecord = RecordOf<DesktopHostRecordProps>;

export type BaseKernelProps = {
  ref: ?KernelRef,
  name: ?string,
  kernelSpecName: ?string,
  lastActivity: ?Date,
  channels: ?rxjs$Subject<*, *>,
  // Canonically: idle, busy, starting
  // Xref: http://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-status
  //
  // We also use this for other bits of lifecycle, including: launching,
  //   shutting down, not connected.
  status: ?string
};

export type RemoteKernelProps = BaseKernelProps & {
  type: "websocket",
  id: ?Id
};

export type LocalKernelProps = BaseKernelProps & {
  type: "zeromq",
  spawn: ?ChildProcess,
  connectionFile: ?string
};

export const makeLocalKernelRecord: RecordFactory<LocalKernelProps> = Record({
  type: "zeromq",
  ref: null,
  kernelSpecName: null,
  name: null,
  lastActivity: null,
  channels: null,
  status: null,
  spawn: null,
  connectionFile: null
});

export const makeRemoteKernelRecord: RecordFactory<RemoteKernelProps> = Record({
  type: "websocket",
  id: null,
  ref: null,
  kernelSpecName: null,
  name: null,
  lastActivity: null,
  channels: null,
  status: null
});

export type LocalKernelRecord = RecordOf<LocalKernelProps>;
