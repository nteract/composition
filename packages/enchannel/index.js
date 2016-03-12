const uuid = require('node-uuid');

/**
 * Filter for response messages
 * @param  {object}  msg - message to check
 * @return {Boolean}
 */
function isChildMessage(msg) {
  return Boolean(this && this.header && msg && msg.parent_header &&
    this.header.msg_id === msg.parent_header.msg_id);
}

/**
 * Create a message
 * @param  {string} username
 * @param  {string} session  guid for the session
 * @param  {string} msg_type
 * @return {object}          msg
 */
function createMessage(username, session, msg_type) {
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

/**
 * Send a shutdown request message
 *
 * Can also be used to restart
 * @param  {string} username
 * @param  {string} session        guid for the session
 * @param  {object} channels       object containing channels
 * @param  {boolean} restart=false should the shutdown request actually restart
 *                                 the kernel
 * @return {Promise}
 */
function shutdownRequest(username, session, channels, restart) {
  const shutDownRequest = createMessage(username, session, 'shutdown_request');
  shutDownRequest.content = { restart };

  const shutDownReply = channels.shell
    .filter(isChildMessage.bind(shutDownRequest))
    .filter(msg => msg.header.msg_type === 'shutdown_reply')
    .map(msg => msg.content);

  return new Promise(resolve => {
    shutDownReply.subscribe(content => {
      if (!restart) {
        channels.shell.complete();
        channels.iopub.complete();
        channels.stdin.complete();
        channels.control.complete();
        if (channels.heartbeat) channels.heartbeat.complete();
      }
      resolve();
    });

    shell.next(shutDownRequest);
  });
}

module.exports = {
  isChildMessage,
  createMessage,
  shutdownRequest,
};
