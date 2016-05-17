const Rx = require('rxjs/Rx');
const Immutable = require('immutable');

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
  createMessage,
} from '../api/messaging';

import {
  createCellAfter,
  updateCellExecutionCount,
  updateCellSource,
  updateCellOutputs,
  updateCellPagers,
  updateCellStatus,
  setLanguageInfo,
} from '../actions';

import { mark, measure } from '../performance';

export function acquireKernelInfo(channels) {
  mark('acquireKernelInfo:enter');
  const { shell } = channels;

  const message = createMessage('kernel_info_request');

  const obs = shell
    .childOf(message)
    .ofMessageType('kernel_info_reply')
    .first()
    .pluck('content', 'language_info')
    .map(setLanguageInfo)
    .publishReplay(1)
    .refCount();

  shell.next(message);
  return obs;
}

const emptyOutputs = new Immutable.List();

function reduceOutputs(outputs, output) {
  if (output.output_type === 'clear_output') {
    return emptyOutputs;
  }

  // Naive implementation of kernel stream buffering
  // This should be broken out into a nice testable function
  if (outputs.size > 0 &&
      output.output_type === 'stream' &&
      typeof output.name !== 'undefined' &&
      outputs.last().get('output_type') === 'stream'
    ) {
    // Invariant: size > 0, outputs.last() exists
    if (outputs.last().get('name') === output.name) {
      return outputs.updateIn([outputs.size - 1, 'text'], text => text + output.text);
    }
    const nextToLast = outputs.butLast().last();
    if (nextToLast &&
        nextToLast.get('output_type') === 'stream' &&
        nextToLast.get('name') === output.name) {
      return outputs.updateIn([outputs.size - 2, 'text'], text => text + output.text);
    }
  }

  mark('acquireKernelInfo:exit');
  return outputs.push(Immutable.fromJS(output));
}

export function executeCell(channels, id, code) {
  mark('executeCell:enter');
  return Rx.Observable.create((subscriber) => {
    if (!channels || !channels.iopub || !channels.shell) {
      subscriber.error('kernel not connected');
      subscriber.complete();
      return () => {};
    }

    const { iopub, shell } = channels;

    // Track all of our subscriptions for full disposal
    const subscriptions = [];

    const executeRequest = createExecuteRequest(code);

    const shellChildren = shell.childOf(executeRequest).share();

    const payloadStream = shellChildren
      .ofMessageType('execute_reply')
      .pluck('content', 'payload')
      .filter(Boolean)
      .flatMap(payloads => Rx.Observable.from(payloads));

    // Sets the next cell source
    const setInputStream = payloadStream
      .filter(payload => payload.source === 'set_next_input');
    subscriptions.push(
      setInputStream.filter(x => x.replace)
        .pluck('text')
        .subscribe(text => {
          subscriber.next(updateCellSource(id, text));
        }));
    subscriptions.push(
      setInputStream.filter(x => !x.replace)
        .pluck('text')
        .subscribe((text) => {
          subscriber.next(createCellAfter('code', id, text));
        }));

    // Update the doc/pager section, clearing it first
    subscriber.next(updateCellPagers(id, new Immutable.List()));
    subscriptions.push(
      payloadStream.filter(p => p.source === 'page')
        .scan((acc, pd) => acc.push(Immutable.fromJS(pd)), new Immutable.List())
        .subscribe((pagerDatas) => {
          subscriber.next(updateCellPagers(id, pagerDatas));
        }));

    const childMessages = iopub.childOf(executeRequest)
                               .share();

    childMessages
      .ofMessageType(['status'])
      .pluck('content', 'execution_state')
      .subscribe((status) => {
        subscriber.next(updateCellStatus(id, status));
      });

    // Update the input numbering: `[ ]`
    subscriptions.push(
      childMessages.ofMessageType(['execute_input'])
                 .pluck('content', 'execution_count')
                 .first()
                 .subscribe((ct) => {
                   subscriber.next(updateCellExecutionCount(id, ct));
                 })
    );

    // Handle all nbformattable messages, clearing output first
    subscriber.next(updateCellOutputs(id, new Immutable.List()));
    subscriptions.push(childMessages
         .ofMessageType(['execute_result', 'display_data', 'stream', 'error', 'clear_output'])
         .map(msgSpecToNotebookFormat)
         // Iteratively reduce on the outputs
         .scan(reduceOutputs, emptyOutputs)
         // Update the outputs with each change
         .subscribe(outputs => {
           mark('executeCell:output');
           measure('executeCell:roundtrip', 'executeCell:enter', 'executeCell:output');
           subscriber.next(updateCellOutputs(id, outputs));
         })
    );

    shell.next(executeRequest);
    mark('executeCell:exit');

    return function executionDisposed() {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  });
}
