// @flow
import type { ChildProcess } from "child_process";

// The Id type is for external resources, e.g. with /api/kernels/9092-7679-9978-8822,
// 9092-7679-9978-8822 is the Id
export opaque type Id = string;
// A ref is an internal Id, used for kernels, hosts, kernelspec collections, etc.
export opaque type Ref = string;

export opaque type KernelRef = Ref;
export opaque type HostRef = Ref;
export opaque type KernelSpecsRef = Ref;

import type { RecordFactory, RecordOf } from "immutable";
import { Record, List } from "immutable";

export type BaseHostProps = {
  id: ?Id,
  ref: ?HostRef,
  selectedKernelRef: ?KernelRef,
  kernelSpecsRef: ?KernelSpecsRef, // reference to a collection of kernelspecs
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
  kernelSpecsRef: null,
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
  kernelSpecsRef: null,
  defaultKernelName: null,
  activeKernelRefs: List()
});

export type DesktopHostRecord = RecordOf<DesktopHostRecordProps>;

export type BaseKernelProps = {
  ref: ?KernelRef,
  kernelSpecName: ?string,
  lastActivity: ?Date,
  channels: ?rxjs$Subject<*, *>,
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
  kernelSpecName: null,
  ref: null,
  name: null,
  lastActivity: null,
  channels: null,
  status: null,
  spawn: null,
  connectionFile: null
});

export const makeRemoteKernelRecord: RecordFactory<RemoteKernelProps> = Record({
  type: "websocket",
  kernelSpecName: null,
  id: null,
  ref: null,
  name: null,
  lastActivity: null,
  channels: null,
  status: null
});

export type LocalKernelRecord = RecordOf<LocalKernelProps>;
export type RemoteKernelRecord = RecordOf<RemoteKernelProps>;
