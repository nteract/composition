import {Subject, fromEvent} from "rxjs";
import {filter, first, tap, takeUntil, map} from "rxjs/operators";
import { Message, POST_MESSAGE_IDENTIFIER, PostMessageType } from "./message";

/**
 * Posts a message to a Window.
 * This method does not return anything, it's a send and forget API.
 * @param destinationWindow
 * @param message
 */
function postMessage<T>(destinationWindow: Window, message: Message<T>) {
  destinationWindow.postMessage(message, '*');
}

/**
 * Makes a Subject which can be used to send and receive post messages.
 * Note that this posts messages to a single `destinationWindow` but recieves
 * messages from any window.
 * @param thisWindow window of the current context.
 * @param destinationWindow window to post messages to.
 */
export function MakePostMessageSubject<T>(
    thisWindow: Window, destinationWindow: Window): Subject<T> {
  // Create an observe which will send the correct message given the Observable
  // event. e.g. an error will trigger an error message to be posted.
  const outboundMessages = {
    next: (payload: T) => postMessage<T>(destinationWindow, {
      id: POST_MESSAGE_IDENTIFIER,
      type: PostMessageType.REGULAR_MESSAGE,
      payload,
    }),
    error: (error: any) => postMessage<T>(destinationWindow, {
      id: POST_MESSAGE_IDENTIFIER,
      type: PostMessageType.ERROR_MESSAGE,
      error,
    }),
    complete: () => postMessage<T>(destinationWindow, {
      id: POST_MESSAGE_IDENTIFIER,
      type: PostMessageType.COMPLETE_MESSAGE,
    })
  };

  // Extract the payload of inbound messages and handle obervable complete and
  // error events.
  const inboundPostMessages = fromEvent<Message<T>>(thisWindow, 'message');
  const closeMessages = inboundPostMessages.pipe(
      filter((message) => message.type === PostMessageType.COMPLETE_MESSAGE));
  const inboundMessages = inboundPostMessages.pipe(
      // Only accept widget post messages.
      filter(message => message && message.id === POST_MESSAGE_IDENTIFIER),
      // Throw an error locally if an error message is received.
      tap(message => {
        if (message.type === PostMessageType.ERROR_MESSAGE) {
          throw new Error(message.error);
        }
      }),
      // Complete when a completion message is received.
      takeUntil(closeMessages.pipe(first())),
      // Extract the payload of regular messages.
      map(message => message.payload));

  return Subject.create(outboundMessages, inboundMessages);
}