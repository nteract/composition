import { Subject, Subscriber, fromEvent, merge } from "rxjs";
import { map, publish, refCount } from "rxjs/operators";
import * as moduleJMP from "jmp";
import uuid from "uuid/v4";
import { Channels, JupyterMessage } from "@nteract/messaging";

export const ZMQType = {
  frontend: {
    iopub: "sub",
    stdin: "dealer",
    shell: "dealer",
    control: "dealer"
  }
};

type ChannelName = "iopub" | "stdin" | "shell" | "control";

export interface JupyterConnectionInfo {
  iopub_port: number;
  shell_port: number;
  stdin_port: number;
  control_port: number;
  signature_scheme: "hmac-sha256";
  hb_port: number;
  ip: string;
  key: string;
  transport: "tcp" | "ipc";
}

interface HeaderFiller {
  session: string;
  username: string;
}

/**
 * Takes a Jupyter spec connection info object and channel and returns the
 * string for a channel. Abstracts away tcp and ipc(?) connection string
 * formatting
 * @param config  Jupyter connection information
 * @param channel Jupyter channel ("iopub", "shell", "control", "stdin")
 * @return The connection string
 */
export const formConnectionString = (
  config: JupyterConnectionInfo,
  channel: ChannelName
) => {
  const portDelimiter = config.transport === "tcp" ? ":" : "-";
  const port = config[(channel + "_port") as keyof JupyterConnectionInfo];
  if (!port) {
    throw new Error(`Port not found for channel "${channel}"`);
  }
  return `${config.transport}://${config.ip}${portDelimiter}${port}`;
};

/**
 * Creates a socket for the given channel with ZMQ channel type given a config
 * @param channel Jupyter channel ("iopub", "shell", "control", "stdin")
 * @param identity UUID
 * @param config  Jupyter connection information
 * @return The new Jupyter ZMQ socket
 */
export const createSocket = (
  channel: ChannelName,
  identity: string,
  config: JupyterConnectionInfo,
  jmp = moduleJMP
): Promise<moduleJMP.Socket> => {
  const zmqType = ZMQType.frontend[channel];
  const scheme = config.signature_scheme.slice("hmac-".length);

  const socket = new jmp.Socket(zmqType, scheme, config.key);
  socket.identity = identity;

  const url = formConnectionString(config, channel);
  return verifiedConnect(socket, url);
};

/**
 * ensures the socket is ready after connecting
 */
export const verifiedConnect = (
  socket: moduleJMP.Socket,
  url: string
): Promise<moduleJMP.Socket> =>
  new Promise(resolve => {
    socket.on("connect", () => {
      // We are not ready until this happens for all the sockets
      socket.unmonitor();
      resolve(socket);
    });
    socket.monitor();
    socket.connect(url);
  });

export const getUsername = () =>
  process.env.LOGNAME ||
  process.env.USER ||
  process.env.LNAME ||
  process.env.USERNAME ||
  "username"; // This is the fallback that the classic notebook uses

/**
 * createMainChannel creates a multiplexed set of channels
 * @param  config                  Jupyter connection information
 * @param  config.ip               IP address of the kernel
 * @param  config.transport        Transport, e.g. TCP
 * @param  config.signature_scheme Hashing scheme, e.g. hmac-sha256
 * @param  config.iopub_port       Port for iopub channel
 * @param  subscription            subscribed topic; defaults to all
 * @param  identity                UUID
 * @return Subject containing multiplexed channels
 */
export const createMainChannel = async (
  config: JupyterConnectionInfo,
  subscription: string = "",
  identity: string = uuid(),
  header: HeaderFiller = {
    session: uuid(),
    username: getUsername()
  },
  jmp = moduleJMP
): Promise<Channels> => {
  const sockets = await createSockets(config, subscription, identity, jmp);
  const main = createMainChannelFromSockets(sockets, header, jmp);
  return main;
};

/**
 * createSockets sets up the sockets for each of the jupyter channels
 */
export const createSockets = async (
  config: JupyterConnectionInfo,
  subscription: string = "",
  identity = uuid(),
  jmp = moduleJMP
) => {
  const [shell, control, stdin, iopub] = await Promise.all([
    createSocket("shell", identity, config, jmp),
    createSocket("control", identity, config, jmp),
    createSocket("stdin", identity, config, jmp),
    createSocket("iopub", identity, config, jmp)
  ]);

  // NOTE: ZMQ PUB/SUB subscription (not an Rx subscription)
  iopub.subscribe(subscription);

  return {
    shell,
    control,
    stdin,
    iopub
  };
};

export const createMainChannelFromSockets = (
  sockets: {
    [name: string]: moduleJMP.Socket;
  },
  header: HeaderFiller = {
    session: uuid(),
    username: getUsername()
  },
  jmp = moduleJMP
): Channels => {
  // The mega subject that encapsulates all the sockets as one multiplexed
  // stream
  const subject = Subject.create(
    Subscriber.create(
      (message?: JupyterMessage) => {
        // There's always a chance that a bad message is sent, we'll ignore it
        // instead of consuming it
        if (!message || !message.channel) {
          console.warn("message sent without a channel", message);
          return;
        }
        const socket = sockets[message.channel];
        if (!socket) {
          // If, for some reason, a message is sent on a channel we don't have
          // a socket for, warn about it but don't bomb the stream
          console.warn("channel not understood for message", message);
          return;
        }
        const jMessage = new jmp.Message({
          // Fold in the setup header to ease usage of messages on channels
          header: { ...message.header, ...header },
          parent_header: message.parent_header,
          content: message.content,
          metadata: message.metadata,
          buffers: message.buffers
        });
        socket.send(jMessage);
      },
      undefined, // not bothering with sending errors on
      () =>
        // When the subject is completed / disposed, close all the event
        // listeners and shutdown the socket
        Object.keys(sockets).forEach(name => {
          const socket = sockets[name];
          socket.removeAllListeners();
          socket.close();
        })
    ),
    // Messages from kernel on the sockets
    merge(
      // Form an Observable with each socket
      ...Object.keys(sockets).map(name => {
        const socket = sockets[name];
        // fromEvent typings are broken. socket will work as an event target.
        return fromEvent(socket as any, "message").pipe(
          map(body => {
            // Route the message for the frontend by setting the channel
            const msg = { ...body, channel: name } as any;
            // Conform to same message format as notebook websockets
            // See https://github.com/n-riesco/jmp/issues/10
            delete msg.idents;
            return msg;
          }),
          publish(),
          refCount()
        );
      })
    ).pipe(
      publish(),
      refCount()
    )
  );

  return subject;
};
