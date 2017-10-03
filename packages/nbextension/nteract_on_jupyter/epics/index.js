// @flow
import { loadEpic } from "./contents";
import { listKernelSpecsEpic } from "./kernelspecs";

const epics = [loadEpic, listKernelSpecsEpic];

export default epics;
