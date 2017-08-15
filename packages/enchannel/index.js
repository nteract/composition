// Import the operators we use
require("rxjs/add/operator/filter");
require("rxjs/add/operator/map");

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
  const shutDownRequest = createMessage(username, session, "shutdown_request");
  shutDownRequest.content = { restart: Boolean(restart) };

  const shutDownReply = channels.shell
    .filter(isChildMessage.bind(null, shutDownRequest))
    .filter(msg => msg.header.msg_type === "shutdown_reply")
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

    channels.shell.next(shutDownRequest);
  });
}

module.exports = {
  shutdownRequest
};
