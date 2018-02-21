// @flow
import type { AllKernelspecsCommunicationRecordProps } from "./kernelspecs";
import type { ContentsCommunicationRecordProps } from "./contents";
import type { HostsCommunicationRecordProps } from "./hosts";
import type { KernelsCommunicationRecordProps } from "./kernels";
import type { PreferencesCommunicationRecordProps } from "./preferences";
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";
import { makeAllKernelspecsCommunicationRecord } from "./kernelspecs";
import { makeContentsCommunicationRecord } from "./contents";
import { makeHostsCommunicationRecord } from "./hosts";
import { makeKernelsCommunicationRecord } from "./kernels";
import { makePreferencesCommunicationRecord } from "./preferences";

export type CommunicationRecordProps = {
  contents: RecordOf<ContentsCommunicationRecordProps>,
  hosts: RecordOf<HostsCommunicationRecordProps>,
  kernels: RecordOf<KernelsCommunicationRecordProps>,
  kernelspecs: RecordOf<AllKernelspecsCommunicationRecordProps>,
  preferences: RecordOf<PreferencesCommunicationRecordProps>
};

export const makeCommunicationRecord: RecordFactory<
  CommunicationRecordProps
> = Record({
  contents: makeContentsCommunicationRecord(),
  hosts: makeHostsCommunicationRecord(),
  kernels: makeKernelsCommunicationRecord(),
  kernelspecs: makeAllKernelspecsCommunicationRecord(),
  preferences: makePreferencesCommunicationRecord()
});
