// @flow
import type { ContentsRecordProps } from "./contents";
import type { HostsRecordProps } from "./hosts";
import type { KernelsRecordProps } from "./kernels";
import type { KernelspecsRecordProps } from "./kernelspecs";
import type { PreferencesRecordProps } from "./preferences";
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";
import { makeContentsRecord } from "./contents";
import { makeHostsRecord } from "./hosts";
import { makeKernelsRecord } from "./kernels";
import { makeKernelspecsRecord } from "./kernelspecs";
import { makePreferencesRecord } from "./preferences";

export type EntitiesRecordProps = {
  contents: RecordOf<ContentsRecordProps>,
  hosts: RecordOf<HostsRecordProps>,
  kernels: RecordOf<KernelsRecordProps>,
  kernelspecs: RecordOf<KernelspecsRecordProps>,
  preferences: RecordOf<PreferencesRecordProps>
};

export const makeEntitiesRecord: RecordFactory<EntitiesRecordProps> = Record({
  contents: makeContentsRecord(),
  hosts: makeHostsRecord(),
  kernels: makeKernelsRecord(),
  kernelspecs: makeKernelspecsRecord(),
  preferences: makePreferencesRecord()
});
