/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

import * as uuid from 'uuid';

const Rx = require('rxjs/Rx');
const Observable = Rx.Observable;

export const session = uuid.v4();

export function getUsername() {
  return process.env.LOGNAME || process.env.USER || process.env.LNAME ||
    process.env.USERNAME;
}

export function createMessage(msg_type) {
  const username = getUsername();
  return {
    header: {
      username,
      session,
      msg_type,
      msg_id: uuid.v4(),
      date: new Date(),
      version: '5.0',
    },
    metadata: {},
    parent_header: {},
    content: {},
  };
}

export function createExecuteRequest(code) {
  const executeRequest = createMessage('execute_request');
  executeRequest.content = {
    code,
    silent: false,
    store_history: true,
    user_expressions: {},
    allow_stdin: false,
    stop_on_error: false,
  };
  return executeRequest;
}

export function msgSpecToNotebookFormat(msg) {
  return Object.assign({}, msg.content, {
    output_type: msg.header.msg_type,
  });
}

/**
 * childOf filters out messages that don't have the parent header matching parentMessage
 * @param  {Object}  parentMessage Jupyter message protocol message
 * @return {Observable}               the resulting observable
 */
export function childOf(parentMessage) {
  const parentMessageID = parentMessage.header.msg_id;
  return Observable.create(subscriber => {
    // since we're in an arrow function `this` is from the outer scope.
    // save our inner subscription
    const subscription = this.subscribe(msg => {
      if (!msg.parent_header || !msg.parent_header.msg_id) {
        subscriber.error(new Error('no parent_header.msg_id on message'));
        return;
      }

      if (parentMessageID === msg.parent_header.msg_id) {
        subscriber.next(msg);
      }
    },
    // be sure to handle errors and completions as appropriate and
    // send them along
    err => subscriber.error(err),
    () => subscriber.complete());

    // to return now
    return subscription;
  });
}

/**
 * ofMessageType is an Rx Operator that filters on msg.header.msg_type
 * being one of messageTypes
 * @param  {Array} messageTypes e.g. ['stream', 'error']
 * @return {Observable}                 the resulting observable
 */
export function ofMessageType(messageTypes) {
  return Observable.create(subscriber => {
    // since we're in an arrow function `this` is from the outer scope.
    // save our inner subscription
    const subscription = this.subscribe(msg => {
      if (!msg.header || !msg.header.msg_type) {
        subscriber.error(new Error('no header.msg_type on message'));
        return;
      }

      if (messageTypes.indexOf(msg.header.msg_type) !== -1) {
        subscriber.next(msg);
      }
    },
    // be sure to handle errors and completions as appropriate and
    // send them along
    err => subscriber.error(err),
    () => subscriber.complete());

    // to return now
    return subscription;
  });
}

Observable.prototype.childOf = childOf;
Observable.prototype.ofMessageType = ofMessageType;
