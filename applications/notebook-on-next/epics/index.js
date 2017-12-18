// @flow
import { loadEpic } from "./contents";
import { listKernelSpecsEpic } from "./kernelspecs";
import { setNotebookEpic } from "./notebook";

const epics = [loadEpic, listKernelSpecsEpic, setNotebookEpic];

export default epics;
