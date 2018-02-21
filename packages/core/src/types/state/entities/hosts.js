// @flow
import type { HostId, KernelId } from "../ids";
import type { HostRef, KernelspecsRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { List, Map, Record } from "immutable";

export type BaseHostProps = {
  id: ?HostId,
  ref: ?HostRef,
  kernelspecsRef: ?KernelspecsRef, // reference to a collection of kernelspecs
  defaultKernelName: string
};

export type JupyterHostRecordProps = BaseHostProps & {
  type: "jupyter",
  token: ?string,
  serverUrl: ?string,
  crossDomain: ?boolean,
  kernelIds: List<KernelId>
};

export const makeJupyterHostRecord: RecordFactory<
  JupyterHostRecordProps
> = Record({
  type: "jupyter",
  ref: null,
  id: null,
  kernelspecsRef: null,
  defaultKernelName: "python",
  kernelIds: List(),
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
  kernelspecsRef: null,
  defaultKernelName: "python",
  kernelIds: List()
});

export type DesktopHostRecord = RecordOf<DesktopHostRecordProps>;

export type HostRecord = DesktopHostRecord | JupyterHostRecord;

export type HostsRecordProps = {
  byRef: Map<HostRef, HostRecord>
};

export const makeHostsRecord: RecordFactory<HostsRecordProps> = Record({
  byRef: Map()
});
