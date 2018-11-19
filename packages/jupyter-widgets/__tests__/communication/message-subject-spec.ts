import { Subject } from "rxjs";
import { first } from "rxjs/operators";
import { EventEmitter } from "events";
import { MakePostMessageSubject } from "../../src/communication/message-subject";

/**
 * Mocks a window-like instance with only post message functionality.
 * @returns a window-like instance, with a `message` event and `postMessage`
 *    function.
 */
function mockWindow(): Window {
  class MockWindow extends EventEmitter {
    postMessage(message: any, targetOrigin: string, transfer: Transferable []): void {
      this.emit('message', message);
    }
  }
  // Unsafely cast the mock window to the Window type, so that we can use it
  // in functions which require a window.
  return (new MockWindow()) as any as Window;
}

describe('MakeMessageSubject', () => {
  // These subjects communicate with each other.
  let messageSubject1: Subject<string>;
  let messageSubject2: Subject<string>;

  beforeEach(() => {
    const window1 = mockWindow();
    const window2 = mockWindow();
    messageSubject1 = MakePostMessageSubject(window1, window2);
    messageSubject2 = MakePostMessageSubject(window2, window1);
  });

  it('communicates messages', async () => {
    const receiver = messageSubject2.pipe(first()).toPromise();
    messageSubject1.next('test');
    expect(await receiver).toEqual('test');
  });

  it('communicates closure', async () => {
    const completionPromise = new Promise<Boolean>((resolve) => {
      messageSubject2.subscribe({complete: () => resolve(true)});
    });
    messageSubject1.complete();
    expect(await completionPromise).toEqual(true);
  });

  it('communicates failure', async () => {
    const errorPromise = new Promise<string>((resolve) => {
      messageSubject2.subscribe({error: resolve});
    });
    messageSubject1.error('error text');
    expect(await errorPromise).toEqual(new Error('error text'));
  });
});