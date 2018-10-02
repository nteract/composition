// @flow
import * as Immutable from "immutable";
import type { ChildProcess } from "child_process";
import type { HostRef, KernelRef } from "../refs";
import type { KernelId, SessionId } from "../ids";
import { Subject } from "rxjs";

import type { KernelInfo } from "./kernel-info";
export type { KernelInfo };

export type LocalKernelProps = {
  kernelSpecName: ?string,
  info: ?KernelInfo,
  hostRef: ?HostRef,
  lastActivity: ?Date,
  channels: rxjs$Subject<*>,
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
  channels: rxjs$Subject<*>,
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

export type KernelRecord = LocalKernelRecord | RemoteKernelRecord;

export type KernelsRecordProps = {
  byRef: Immutable.Map<KernelRef, KernelRecord>
};

export const makeKernelsRecord: Immutable.RecordFactory<
  KernelsRecordProps
> = Immutable.Record({
  byRef: Immutable.Map()
});
