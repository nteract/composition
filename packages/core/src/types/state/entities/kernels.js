// @flow
import type { HostRef, KernelRef } from "../refs";
import type { KernelId } from "../ids";
import type { RecordFactory, RecordOf } from "immutable";
import { ChildProcess } from "child_process";
import { Map, Record } from "immutable";

export type BaseKernelProps = {
  ref: ?KernelRef,
  name: ?string,
  kernelSpecName: ?string,
  hostRef: ?HostRef,
  lastActivity: ?Date,
  channels: ?rxjs$Subject<*, *>,
  cwd: string,
  // Canonically: idle, busy, starting
  // Xref: http://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-status
  //
  // We also use this for other bits of lifecycle, including: launching,
  //   shutting down, not connected.
  status: ?string
};

export type LocalKernelProps = BaseKernelProps & {
  type: "zeromq",
  spawn: ?ChildProcess,
  connectionFile: ?string
};

export const makeLocalKernelRecord: RecordFactory<LocalKernelProps> = Record({
  type: "zeromq",
  cwd: ".",
  ref: null,
  kernelSpecName: null,
  hostRef: null,
  name: null,
  lastActivity: null,
  channels: null,
  status: null,
  spawn: null,
  connectionFile: null
});

export type LocalKernelRecord = RecordOf<LocalKernelProps>;

export type RemoteKernelProps = BaseKernelProps & {
  type: "websocket",
  id: ?KernelId
};

export const makeRemoteKernelRecord: RecordFactory<RemoteKernelProps> = Record({
  type: "websocket",
  cwd: ".",
  id: null,
  ref: null,
  kernelSpecName: null,
  hostRef: null,
  name: null,
  lastActivity: null,
  channels: null,
  status: null
});

export type RemoteKernelRecord = RecordOf<RemoteKernelProps>;

export type KernelRecord = LocalKernelRecord | RemoteKernelRecord;

export type KernelsRecordProps = {
  byRef: Map<KernelRef, KernelRecord>
};

export const makeKernelsRecord: RecordFactory<KernelsRecordProps> = Record({
  byRef: Map()
});
