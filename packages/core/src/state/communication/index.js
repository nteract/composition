// @flow
import * as Immutable from "immutable";

import type { ContentsCommunicationRecordProps } from "./contents";
import type { KernelsCommunicationRecordProps } from "./kernels";
import type { KernelspecsCommunicationRecordProps } from "./kernelspecs";
import { makeContentsCommunicationRecord } from "./contents";
import { makeKernelsCommunicationRecord } from "./kernels";
import { makeKernelspecsCommunicationRecord } from "./kernelspecs";

export * from "./contents";
export * from "./kernels";
export * from "./kernelspecs";

export type CommunicationRecordProps = {
  contents: Immutable.RecordOf<ContentsCommunicationRecordProps>,
  kernels: Immutable.RecordOf<KernelsCommunicationRecordProps>,
  kernelspecs: Immutable.RecordOf<KernelspecsCommunicationRecordProps>
};

export const makeCommunicationRecord: Immutable.RecordFactory<
  CommunicationRecordProps
> = Immutable.Record({
  contents: makeContentsCommunicationRecord(),
  kernels: makeKernelsCommunicationRecord(),
  kernelspecs: makeKernelspecsCommunicationRecord()
});
