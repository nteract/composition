import {
  SHELL,
  STDIN,
  IOPUB,
  CONTROL,
} from './constants';

import {
  createSubject,
  createSocket,
} from './subjection';

/**
 * createShellSubject creates a subject for sending and receiving messages on a
 * kernel's shell channel
 * @param  {string} identity UUID
 * @param  {Object} config                  Jupyter connection information
 * @param  {string} config.ip               IP address of the kernel
 * @param  {string} config.transport        Transport, e.g. TCP
 * @param  {string} config.signature_scheme Hashing scheme, e.g. hmac-sha256
 * @param  {number} config.shell_port       Port for shell channel
 * @return {Rx.Subject} subject for sending and receiving messages on the shell
 *                      channel
 */
export function createShellSubject(identity, config) {
  return createSubject(createSocket(SHELL, identity, config));
}

/**
 * createControlSubject creates a subject for sending and receiving on a
 * kernel's control channel
 * @param  {string} identity UUID
 * @param  {Object} config                  Jupyter connection information
 * @param  {string} config.ip               IP address of the kernel
 * @param  {string} config.transport        Transport, e.g. TCP
 * @param  {string} config.signature_scheme Hashing scheme, e.g. hmac-sha256
 * @param  {number} config.control_port     Port for control channel
 * @return {Rx.Subject} subject for sending and receiving messages on the control
 *                      channel
 */
export function createControlSubject(identity, config) {
  return createSubject(createSocket(CONTROL, identity, config));
}

/**
 * createStdinSubject creates a subject for sending and receiving messages on a
 * kernel's stdin channel
 * @param  {string} identity UUID
 * @param  {Object} config                  Jupyter connection information
 * @param  {string} config.ip               IP address of the kernel
 * @param  {string} config.transport        Transport, e.g. TCP
 * @param  {string} config.signature_scheme Hashing scheme, e.g. hmac-sha256
 * @param  {number} config.stdin_port       Port for stdin channel
 * @return {Rx.Subject} subject for sending and receiving messages on the stdin
 *                      channel
 */
export function createStdinSubject(identity, config) {
  return createSubject(createSocket(STDIN, identity, config));
}

/**
 * createIOPubSubject creates a shell subject for receiving messages on a
 * kernel's iopub channel
 * @param  {string} identity UUID
 * @param  {Object} config                  Jupyter connection information
 * @param  {string} config.ip               IP address of the kernel
 * @param  {string} config.transport        Transport, e.g. TCP
 * @param  {string} config.signature_scheme Hashing scheme, e.g. hmac-sha256
 * @param  {number} config.iopub_port       Port for iopub channel
 * @param  {string} subscription            subscribed topic; defaults to all
 * @return {Rx.Subject} subject for receiving messages on the shell_port
 *                      channel
 */
export function createIOPubSubject(identity, config, subscription = '') {
  const ioPubSocket = createSocket(IOPUB, identity, config);
  ioPubSocket.subscribe(subscription);
  return createSubject(ioPubSocket);
}
