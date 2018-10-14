// @flow

import { createHmac } from "crypto";

/**
 *
 * This file implements the wire protocol for use with zeromq backed kernels
 * https://jupyter-client.readthedocs.io/en/stable/messaging.html#the-wire-protocol
 *
 * Raw protocol example, as multiple frames:

  [
    'u-u-i-d',         // zmq identity(ies)
    '<IDS|MSG>',       // delimiter
    'baddad42',        // HMAC signature
    '{header}',        // serialized header dict
    '{parent_header}', // serialized parent header dict
    '{metadata}',      // serialized metadata dict
    '{content}',       // serialized content dict
    '\xf0\x9f\x90\xb1' // extra raw data buffer(s)
    ...
  ]

 */

// The delimiter is expected after zmq identities and before the HMAC signature for a message
const DELIMITER = "<IDS|MSG>";

export class Message {
  idents: Array<string>;
  header: Object;
  parent_header: Object;
  metadata: Object;
  content: Object;
  buffers: Array<string | Buffer>;
  constructor(properties: ?Object) {
    this.idents = (properties && properties.idents) || [];
    this.header = (properties && properties.header) || {};
    this.parent_header = (properties && properties.parent_header) || {};
    this.metadata = (properties && properties.metadata) || {};
    this.content = (properties && properties.content) || {};
    this.buffers = (properties && properties.buffers) || [];
  }
}

export function encodeJupyterMessage(
  message: Message,
  scheme: string,
  key: string
) {
  scheme = scheme || "sha256";
  key = key || "";

  const idents = message.idents;

  const header = JSON.stringify(message.header);
  const parent_header = JSON.stringify(message.parent_header);
  const metadata = JSON.stringify(message.metadata);
  const content = JSON.stringify(message.content);

  let signature = "";
  if (key) {
    const hmac = createHmac(scheme, key);
    const encoding = "utf8";
    hmac.update(new Buffer.from(header, encoding));
    hmac.update(new Buffer.from(parent_header, encoding));
    hmac.update(new Buffer.from(metadata, encoding));
    hmac.update(new Buffer.from(content, encoding));
    signature = hmac.digest("hex");
  }

  return [
    ...idents,
    DELIMITER,
    signature,
    header,
    parent_header,
    metadata,
    content,
    ...message.buffers
  ];
}

export function decodeJupyterMessage(
  messageFrames: Array<*>,
  scheme: string,
  key: string
) {
  scheme = scheme || "sha256";
  key = key || "";

  let i = 0;
  let idents = [];
  for (i = 0; i < messageFrames.length; i++) {
    const frame = messageFrames[i];
    if (frame.toString() === DELIMITER) {
      break;
    }
    idents.push(frame);
  }

  if (messageFrames.length - i < 5) {
    console.warn("MESSAGE: DECODE: Not enough message frames", messageFrames);
    return null;
  }

  if (messageFrames[i].toString() !== DELIMITER) {
    console.warn("MESSAGE: DECODE: Missing delimiter", messageFrames);
    return null;
  }

  if (key) {
    const obtainedSignature = messageFrames[i + 1].toString();

    const hmac = createHmac(scheme, key);
    hmac.update(messageFrames[i + 2]);
    hmac.update(messageFrames[i + 3]);
    hmac.update(messageFrames[i + 4]);
    hmac.update(messageFrames[i + 5]);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== obtainedSignature) {
      console.warn(
        "MESSAGE: DECODE: Incorrect message signature:",
        "Obtained = " + obtainedSignature,
        "Expected = " + expectedSignature
      );
      return null;
    }
  }

  return new Message({
    idents: idents,
    header: toJSON(messageFrames[i + 2]),
    parent_header: toJSON(messageFrames[i + 3]),
    content: toJSON(messageFrames[i + 5]),
    metadata: toJSON(messageFrames[i + 4]),
    buffers: messageFrames.slice(i + 6)
  });
}

function toJSON(value) {
  return JSON.parse(value.toString());
}
