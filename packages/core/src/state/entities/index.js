// @flow
import * as Immutable from "immutable";
import type { ContentsRecordProps } from "./contents";
import type { HostsRecordProps } from "./hosts";
import type { KernelsRecordProps } from "./kernels";
import type { KernelspecsRecordProps } from "./kernelspecs";
import type { ModalsRecordProps } from "./modals";
import { makeContentsRecord } from "./contents";
import { makeHostsRecord } from "./hosts";
import { makeKernelsRecord } from "./kernels";
import { makeKernelspecsRecord } from "./kernelspecs";
import { makeModalsRecord } from "./modals";

export * from "./contents";
export * from "./hosts";
export * from "./kernels";
export * from "./kernelspecs";
export * from "./modals";

export type EntitiesRecordProps = {
  contents: Immutable.RecordOf<ContentsRecordProps>,
  hosts: Immutable.RecordOf<HostsRecordProps>,
  kernels: Immutable.RecordOf<KernelsRecordProps>,
  kernelspecs: Immutable.RecordOf<KernelspecsRecordProps>,
  modals: Immutable.RecordOf<ModalsRecordProps>
};

export type EntitiesRecord = Immutable.RecordOf<EntitiesRecordProps>;

export const makeEntitiesRecord: Immutable.RecordFactory<
  EntitiesRecordProps
> = Immutable.Record({
  contents: makeContentsRecord(),
  hosts: makeHostsRecord(),
  kernels: makeKernelsRecord(),
  kernelspecs: makeKernelspecsRecord(),
  modals: makeModalsRecord()
});
