// @flow
import { loadEpic } from "./contents";
import { listKernelSpecsEpic } from "./kernelspecs";
import { startKernelEpic, autoconnectEpic } from "./kernels";

const epics = [loadEpic, listKernelSpecsEpic, startKernelEpic, autoconnectEpic];

export default epics;
