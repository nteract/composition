import { notifications, sendNotification } from "@nteract/mythic-notifications";
import { StateObservable } from "redux-observable";
import { of } from "rxjs";
import { TestScheduler } from "rxjs/testing";

const buildScheduler = () =>
  new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe("notifications", () => {
  test("emits a notification when sendNotification is reduced", () => {
    const originalState = notifications.makeStateRecord({
      current: {
        addNotification: jest.fn(),
      },
    });

    const state = notifications.rootReducer(originalState,
      sendNotification.create({
        title: "add me add me add me",
        message: "you just gotta addNotification() me",
        level: "info",
      },
    ));

    expect(state).toEqual(originalState);
    expect(state.current.addNotification).toBeCalledTimes(1);
  });

  test("emits sendNotification on an error action", () => {
    const originalState = {
      __private__: {
        notifications: notifications.makeStateRecord({
          current: {
            addNotification: jest.fn(),
          },
        }),
      }
    };

    buildScheduler().run(helpers => {
      const { hot, expectObservable } = helpers;
      const inputActions = {
        a: {
          type: "catContent/downloadFailed",
          error: true,
          payload: {
            contentRef: "🐈 cat content 🐈",
            error: new Error("😿 no new cat pics found 😿"),
          },
        },
        b: {
          type: "CORE/BAD_BAD_NOT_GOOD_ERROR",
          error: true,
          payload: new Error("🙀"),
        },
      };

      const outputActions = {
        A: sendNotification.create({
          title: "Download failed",
          message: "😿 no new cat pics found 😿",
          level: "error",
        }),
        B: sendNotification.create({
          title: "Bad bad not good error",
          message: "🙀",
          level: "error",
        }),
      };

      const inputMarbles  = "ab|";
      const outputMarbles = "AB|";

      const inputAction$ = hot(inputMarbles, inputActions);
      const outputAction$ = notifications.makeRootEpic()(
        inputAction$,
        new StateObservable(of(), originalState),
        {},
      );

      expectObservable(outputAction$).toBe(outputMarbles, outputActions);
    });
  });
});
