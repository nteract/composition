// @flow
import * as actionTypes from "./actionTypes";

// Simple actions related to UI state.
export const setCurrentKernelName = (payload: string) => ({
  type: actionTypes.SET_CURRENT_KERNEL_NAME,
  payload
});
export const setCurrentServerId = (payload: { serverId: string }) => ({
  type: actionTypes.SET_CURRENT_SERVER_ID,
  payload
});
export const setPlatform = (payload: string) => ({
  type: actionTypes.SET_PLATFORM,
  payload
});
export const setShowPanel = (payload: boolean) => ({
  type: actionTypes.SET_SHOW_PANEL,
  payload
});
export const setSource = (payload: string) => ({
  type: actionTypes.SET_SOURCE,
  payload
});
export const submitBinderForm = (payload: {
  repo: string,
  gitref: string
}) => ({
  type: actionTypes.SUBMIT_BINDER_FORM,
  payload
});

// Actions related to servers.
export const activateServer = (payload: {
  serverId: string,
  oldServerId: string,
  repo: string,
  gitref: string
}) => ({
  type: actionTypes.ACTIVATE_SERVER,
  payload
});
export const activateServerFulfilled = (payload: {
  serverId: string,
  config: object
}) => ({
  type: actionTypes.ACTIVATE_SERVER_FULFILLED,
  payload
});
export const activateServerFailed = (payload: {
  serverId: string,
  error: object
}) => ({
  type: actionTypes.ACTIVATE_SERVER_FAILED,
  payload
});

export const killServer = (payload: { serverId: string }) => ({
  type: actionTypes.KILL_SERVER,
  payload
});
export const killServerFulfilled = (payload: { serverId: string }) => ({
  type: actionTypes.KILL_SERVER_FULFILLED,
  payload
});
export const killServerFailed = (payload: {
  serverId: string,
  error: object
}) => ({
  type: actionTypes.KILL_SERVER_FAILED,
  payload
});

export const fetchKernelSpecs = (payload: { serverId: string }) => ({
  type: actionTypes.FETCH_KERNEL_SPECS,
  payload
});
export const fetchKernelSpecsFulfilled = (payload: {
  serverId: string,
  repsonse: object
}) => ({
  type: actionTypes.FETCH_KERNEL_SPECS_FULFILLED,
  payload
});
export const fetchKernelSpecsFailed = (payload: {
  serverId: string,
  error: object
}) => ({
  type: actionTypes.FETCH_KERNEL_SPECS_FAILED,
  payload
});

export const addServerMessage = (payload: {
  serverId: string,
  message: string
}) => ({
  type: actionTypes.ADD_SERVER_MESSAGE,
  payload
});

// Actions related to kernels.
export const activateKernel = (payload: {
  serverId: string,
  kernelName: string
}) => ({
  type: actionTypes.ACTIVATE_KERNEL,
  payload
});
export const activateKernelFulfilled = (payload: {
  serverId: string,
  kernelName: string,
  kernel: object
}) => ({
  type: actionTypes.ACTIVATE_KERNEL_FULFILLED,
  payload
});
export const activateKernelFailed = (payload: {
  serverId: string,
  kernelName: string,
  error: object
}) => ({
  type: actionTypes.ACTIVATE_KERNEL_FAILED,
  payload
});

export const interruptKernel = (payload: {
  serverId: string,
  kernelName: string
}) => ({
  type: actionTypes.INTERRUPT_KERNEL,
  payload
});
export const interruptKernelFulfilled = (payload: {
  serverId: string,
  kernelName: string
}) => ({
  type: actionTypes.INTERRUPT_KERNEL_FULFILLED,
  payload
});
export const interruptKernelFailed = (payload: {
  serverId: string,
  kernelName: string,
  error: object
}) => ({
  type: actionTypes.INTERRUPT_KERNEL_FAILED,
  payload
});

export const killKernel = (payload: {
  serverId: string,
  kernelName: string
}) => ({
  type: actionTypes.KILL_KERNEL,
  payload
});
export const killKernelFulfilled = (payload: {
  serverId: string,
  kernelName: string
}) => ({
  type: actionTypes.KILL_KERNEL_FULFILLED,
  payload
});
export const killKernelFailed = (payload: {
  serverId: string,
  kernelName: string,
  error: object
}) => ({
  type: actionTypes.KILL_KERNEL_FAILED,
  payload
});

export const addKernelMessage = (payload: {
  serverId: string,
  kernelName: string,
  message: object
}) => ({
  type: actionTypes.ADD_KERNEL_MESSAGE,
  payload
});
export const addKernelOutput = (payload: {
  serverId: string,
  kernelName: string,
  output: object
}) => ({
  type: actionTypes.ADD_KERNEL_OUTPUT,
  payload
});
export const clearKernelOutputs = (payload: {
  serverId: string,
  kernelName: string
}) => ({
  type: actionTypes.CLEAR_KERNEL_OUTPUTS,
  payload
});
export const restartKernel = (payload: {
  serverId: string,
  kernelName: string
}) => ({
  type: actionTypes.RESTART_KERNEL,
  payload
});
export const runSource = (payload: {
  serverId: string,
  kernelName: string,
  source: string
}) => ({
  type: actionTypes.RUN_SOURCE,
  payload
});
export const setActiveKernel = (payload: {
  serverId: string,
  kernelName: string
}) => ({
  type: actionTypes.SET_ACTIVE_KERNEL,
  payload
});
export const setKernelStatus = (payload: {
  serverId: string,
  kernelName: string
}) => ({
  type: actionTypes.SET_KERNEL_STATUS,
  payload
});
