/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2015, Nicolas Riesco and others as credited in the AUTHORS file
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 */

import * as crypto from "crypto";
import * as uuid from "uuid/v4";
import * as zmq from "zeromq";

import { EventEmitter } from "events";

import { JupyterMessage } from "@nteract/messaging";
import { encodeJupyterMessage, decodeJupyterMessage } from "./messages";

class JupyterSocket extends EventEmitter {
  scheme: string;
  key: string;

  private zmqSocket: zmq.Socket;

  constructor(socketType: string, scheme: string, key: string) {
    super();
    this.zmqSocket = zmq.createSocket(socketType);

    this.scheme = scheme;
    this.key = key;
  }

  send(message: JupyterMessage) {
    // LEFT OFF at encoding here
    // Q: Do we need to add in some idents here
    const encodedMessage = encodeJupyterMessage(message, this.scheme, this.key);

    this.zmqSocket.send(encodedMessage);
  }
}

/**
 * Add listener to the end of the listeners array for the specified event
 *
 * @param {String}   event
 * @param {Function} listener
 * @returns {module:jmp~Socket} `this` to allow chaining
 */
Socket.prototype.on = function(event, listener) {
  var p = Object.getPrototypeOf(Socket.prototype);

  if (event !== "message") {
    return p.on.apply(this, arguments);
  }

  var _listener = {
    unwrapped: listener,
    wrapped: function() {
      var message = Message._decode(arguments, this._jmp.scheme, this._jmp.key);
      if (message) {
        listener(message);
      }
    }.bind(this)
  };
  this._jmp._listeners.push(_listener);
  return p.on.call(this, event, _listener.wrapped);
};

/**
 * Add listener to the end of the listeners array for the specified event
 *
 * @method module:jmp~Socket#addListener
 * @param {String}   event
 * @param {Function} listener
 * @returns {module:jmp~Socket} `this` to allow chaining
 */
Socket.prototype.addListener = Socket.prototype.on;

/**
 * Add a one-time listener to the end of the listeners array for the specified
 * event
 *
 * @param {String}   event
 * @param {Function} listener
 * @returns {module:jmp~Socket} `this` to allow chaining
 */
Socket.prototype.once = function(event, listener) {
  var p = Object.getPrototypeOf(Socket.prototype);

  if (event !== "message") {
    return p.once.apply(this, arguments);
  }

  var _listener = {
    unwrapped: listener,
    wrapped: function() {
      var message = Message._decode(arguments, this._jmp.scheme, this._jmp.key);

      if (message) {
        try {
          listener(message);
        } catch (error) {
          Socket.prototype.removeListener.call(this, event, listener);
          throw error;
        }
      }

      Socket.prototype.removeListener.call(this, event, listener);
    }.bind(this)
  };

  this._jmp._listeners.push(_listener);

  return p.on.call(this, event, _listener.wrapped);
};

/**
 * Remove listener from the listeners array for the specified event
 *
 * @param {String}   event
 * @param {Function} listener
 * @returns {module:jmp~Socket} `this` to allow chaining
 */
Socket.prototype.removeListener = function(event, listener) {
  var p = Object.getPrototypeOf(Socket.prototype);

  if (event !== "message") {
    return p.removeListener.apply(this, arguments);
  }

  var length = this._jmp._listeners.length;
  for (var i = 0; i < length; i++) {
    var _listener = this._jmp._listeners[i];
    if (_listener.unwrapped === listener) {
      this._jmp._listeners.splice(i, 1);
      return p.removeListener.call(this, event, _listener.wrapped);
    }
  }

  return p.removeListener.apply(this, arguments);
};

/**
 * Remove all listeners, or those for the specified event
 *
 * @param {String} [event]
 * @returns {module:jmp~Socket} `this` to allow chaining
 */
Socket.prototype.removeAllListeners = function(event) {
  var p = Object.getPrototypeOf(Socket.prototype);

  if (arguments.length === 0 || event === "message") {
    this._jmp._listeners.length = 0;
  }

  return p.removeAllListeners.apply(this, arguments);
};
