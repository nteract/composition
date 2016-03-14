const uuid = require('node-uuid');

/**
 * Filter for finding out if message is a child of parentMessage
 * @param  {Object}  parentMessage the expected parent
 * @param  {Object}  message - message to evaluate lineage
 * @return {Boolean}
 */
function isChildMessage(parentMessage, message) {
  return Boolean(
    parentMessage && parentMessage.header &&
    message && message.parent_header &&
    parentMessage.header.msg_id === message.parent_header.msg_id);
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
 * @param  {object} channels       object containing channels
 * @param  {string} username
 * @param  {string} session        guid for the session
 * @param  {boolean} restart=false should the shutdown request actually restart
 *                                 the kernel
 * @return {Promise}
 */
function shutdownRequest(channels, username, session, restart) {
  const shutDownRequest = createMessage(username, session, 'shutdown_request');
  shutDownRequest.content = { restart: Boolean(restart) };

  const shutDownReply = channels.shell
    .filter(isChildMessage.bind(null, shutDownRequest))
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
