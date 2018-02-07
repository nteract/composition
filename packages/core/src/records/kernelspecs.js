// @flow
import type { RecordFactory, RecordOf } from "immutable";
import { List, Map, Record } from "immutable";

export type CommunicationKernelspecsProps = {
  loading: boolean,
  error: ?Object
};

export type CommunicationKernelspecs = RecordOf<CommunicationKernelspecsProps>;

export const makeCommunicationKernelspecs: RecordFactory<
  CommunicationKernelspecsProps
> = Record({
  loading: false,
  error: null
});

export type KernelspecProps = {
  name: ?string,
  resources: Map<string, *>,
  language: ?string,
  argv: List<string>,
  env: Map<string, *>,
  interrupt_mode: ?string
};

export type Kernelspecs = Map<string, RecordOf<KernelspecProps>>;

export type Kernelspec = RecordOf<KernelspecProps>;

export const makeKernelspec: RecordFactory<KernelspecProps> = Record({
  name: null,
  resources: Map(),
  language: null,
  argv: List(),
  env: Map(),
  interrupt_mode: null
});
