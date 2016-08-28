import * as uuid from 'uuid';
import Rx from 'rxjs/Rx';
import { createMessage } from '../api/messaging';
import { stateObservable } from './utils';

/** TODO: Move to more generic location
 * Get an Observable for kernel channels.
 *
 * To get the current channel object, use `getChannels(store).first().toPromise()`.
 * This observable is designed to permit past, present, and future subscriptions.
 * For a POC, see http://jsbin.com/tujapaciwo/5/edit?js,console
 * @param  {Redux.store} store
 * @return {Observable} observable of the kernel channels object
 */
export function getChannels(actions$, store) {
  // For a proof of concept, see the following JSBin:
  // http://jsbin.com/tujapaciwo/5/edit?js,console

  // Defer the initial value till the channels are subscribed to.  This will
  // make it so the action of a subscription will cause the current channels to
  // be emitted, regardless of whether or not they were set long before when
  // the subscriber subscribes.
  return Rx.Observable.defer(() => {
    let currentChannels;
    if (store.app) {
      currentChannels = store.app.channels;
    }
    return currentChannels;
  })

  // Listen to channel change events.
  .merge(stateObservable(actions$, store)
    .pluck('app')
    .pluck('channels')
  )

  // Don't emit null or undefined values, only emit changes, and remember the
  // last state for delayed subscriptions.
  .filter(Boolean)
  .distinctUntilChanged()
  .publishReplay(1) // Only remember the last state
  .refCount();
}

/** TODO: Move to more generic location
 * Send a message on the connected, or soon to be connected, kernel.
 * @param  {Redux.store} store
 * @param  {string} channel - name of the chanel to send the message on
 * @param  {object} msg - Jupyter message to send
 * @return {Promise} Promise that resolves when the message has been sent
 */
export function sendMsg(actions$, store, channel, msg) {
  return getChannels(actions$, store)
    .pluck(channel)
    .first()
    .toPromise()
    .then(channelSubject => {
      const tempSubscription = channelSubject.subscribe(() => {});
      channelSubject.next(msg);
      tempSubscription.unsubscribe();
    });
}

/**
 * Get an Observable for comm related messages.
 * @param  {Redux.store} store
 * @return {Observable} Observable of comm related messages.
 */
function commRelatedMessages(actions$, store) {
  return getChannels(actions$, store).switchMap(channels => {
    if (!channels.iopub) {
      return Rx.Observable.empty();
    }
    return channels.iopub.filter(msg =>
      msg && msg.header && msg.header.msg_type &&
      msg.header.msg_type.slice(0, 5) === 'comm_'
    );
  });
}

/**
 * Get an Observable for comm open messages.
 * @param  {Redux.store} store
 * @return {Observable} Observable of comm open messages.
 */
export function commOpenMessages(actions$, store) {
  return commRelatedMessages(actions$, store)
    .filter(msg => msg.header.msg_type === 'comm_open');
}

/**
 * Get an Observable for comm close messages.
 * @param  {Redux.store} store
 * @return {Observable} Observable of comm close messages.
 */
export function commCloseMessages(actions$, store) {
  return commRelatedMessages(actions$, store)
    .filter(msg => msg.header.msg_type === 'comm_close');
}

/**
 * Get an Observable for comm "msg" messages (normal communications).
 * @param  {Redux.store} store
 * @return {Observable} Observable of comm messages.
 */
export function commMessages(actions$, store) {
  return commRelatedMessages(actions$, store)
    .filter(msg => msg.header.msg_type === 'comm_msg');
}

/**
 * Get the comm id of a comm message.
 * @param  {object} msg
 * @return {string} comm id
 */
export function getCommId(msg) {
  return msg.content.comm_id;
}

/**
 * Make a message filter for a specific comm
 * @param  {string} commId - comm id of messages to filter for
 * @return {function} predicate function (filter)
 */
export function commIdFilter(commId) {
  return msg => getCommId(msg) === commId;
}

/**
 * Get the target name of a comm open message.
 * @param  {object} msg
 * @return {string} target name
 */
export function getCommTargetName(msg) {
  return msg.content.target_name;
}

/**
 * Get the comm message data
 * @param  {object} msg - comm "msg" message
 * @return {object} message data
 */
export function getMessageData(msg) {
  return msg.content.data;
}

/**
 * Opens a new comm.
 * @param  {Redux.store} store
 * @param  {string} commTargetName - backend target name of the comm to create
 * @param  {object} [data] - optional, associated comm open data
 * @param  {object} [originalHeader] - optional, parent header
 * @return {Promise<{commId, msgId}>} Promise for the new comm's id and the id
 *                                    of the msg sent to open the comm.
 */
export function openComm(actions$, store, commTargetName, data, originalHeader) {
  const commId = uuid.v4();
  const openMsg = createMessage('comm_open');
  openMsg.content = {
    comm_id: commId,
    target_name: commTargetName,
    data,
  };
  openMsg.parent_header = originalHeader || openMsg.parent_header;

  return sendMsg(actions$, store, 'shell', openMsg).then(() => ({
    commId,
    msgId: openMsg.header.msg_id,
  }));
}

/**
 * Creates and sends a comm message.
 * @param  {Redux.store} store
 * @param  {string} commId - id of the comm to send a message to
 * @param  {object} data - comm msg data
 * @param  {object} [originalHeader] - optional, parent header
 * @return {Promise<string>} Promise for the message id
 */
export function sendCommMessage(actions$, store, commId, data, originalHeader) {
  const msg = createMessage('comm_msg');
  msg.content = {
    comm_id: commId,
    data,
  };
  msg.parent_header = originalHeader || msg.parent_header;

  return sendMsg(actions$, store, 'shell', msg).then(() => msg.header.msg_id);
}
