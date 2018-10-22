// @flow
import type { ChildProcess } from "child_process";

import * as Immutable from "immutable";
import { Subject } from "rxjs";

import type { HostRef, KernelRef } from "../refs";
import type { KernelId, SessionId } from "../ids";

import type { KernelInfo } from "./kernel-info";

export type { KernelInfo };

// See #3427. This represents the kernel early in the launch process.
// With a bit more work we could probably drop this and just use either
// Local or RemoteKernelProps as our initial representation of the kernel,
// deriving local-vs-remote from known sources of truth about kernels.
export type KernelNotStartedProps = {
  kernelSpecName: ?string,
  status: ?string,
  // The following properties are not known immediately at the start of
  // launch; they are just included to keep Flow happy and minimize the
  // impact of this likely-to-be-deleted type.
  type: "unknown",
  cwd: ".",
  channels: rxjs$Subject<*>,
  info: ?KernelInfo
};

export type KernelNotStartedRecord = Immutable.RecordOf<KernelNotStartedProps>;

export const makeKernelNotStartedRecord: Immutable.RecordFactory<
  KernelNotStartedProps
> = Immutable.Record({
  kernelSpecName: null,
  status: null,
  type: "unknown",
  cwd: ".",
  channels: new Subject(),
  info: null
});

export type LocalKernelProps = {
  kernelSpecName: ?string,
  info: ?KernelInfo,
  hostRef: ?HostRef,
  lastActivity: ?Date,
  channels: Subject<*>,
  cwd: string,
  // Canonically: idle, busy, starting
  // Xref: http://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-status
  //
  // We also use this for other bits of lifecycle, including: launching,
  //   shutting down, not connected.
  status: ?string,
  type: "zeromq",
  spawn: ?ChildProcess,
  connectionFile: ?string
};

export const makeLocalKernelRecord: Immutable.RecordFactory<
  LocalKernelProps
> = Immutable.Record({
  type: "zeromq",
  cwd: ".",
  info: null,
  kernelSpecName: null,
  hostRef: null,
  lastActivity: null,
  channels: new Subject(),
  status: null,
  spawn: null,
  connectionFile: null
});

export type LocalKernelRecord = Immutable.RecordOf<LocalKernelProps>;

export type RemoteKernelProps = {
  kernelSpecName: ?string,
  info: ?KernelInfo,
  hostRef: ?HostRef,
  lastActivity: ?Date,
  channels: Subject<*>,
  cwd: string,
  // Canonically: idle, busy, starting
  // Xref: http://jupyter-client.readthedocs.io/en/stable/messaging.html#kernel-status
  //
  // We also use this for other bits of lifecycle, including: launching,
  //   shutting down, not connected.
  status: ?string,
  type: "websocket",
  sessionId: ?SessionId,
  id: ?KernelId
};

export const makeRemoteKernelRecord: Immutable.RecordFactory<
  RemoteKernelProps
> = Immutable.Record({
  type: "websocket",
  info: null,
  cwd: ".",
  id: null,
  kernelSpecName: null,
  hostRef: null,
  lastActivity: null,
  channels: new Subject(),
  sessionId: null,
  status: null
});

export type RemoteKernelRecord = Immutable.RecordOf<RemoteKernelProps>;

export type KernelRecord =
  | KernelNotStartedRecord
  | LocalKernelRecord
  | RemoteKernelRecord;

export type KernelsRecordProps = {
  byRef: Immutable.Map<KernelRef, KernelRecord>
};

export const makeKernelsRecord: Immutable.RecordFactory<
  KernelsRecordProps
> = Immutable.Record({
  byRef: Immutable.Map()
});
