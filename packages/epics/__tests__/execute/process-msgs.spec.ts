import * as actions from "@nteract/actions";
import { mockAppState } from "@nteract/fixtures";
import * as stateModule from "@nteract/types";
import { StateObservable } from "redux-observable";
import { from, of, Subject } from "rxjs";
import { toArray } from "rxjs/operators";

import { sendInputReplyEpic, updateDisplayEpic } from "../../src/execute";

const Immutable = require("immutable");

describe("updateDisplayEpic", () => {
  test("handles update_display_data messages", done => {
    const messages = [
      // Should be processed
      {
        header: { msg_type: "update_display_data" },
        content: {
          data: { "text/html": "<marquee>wee</marquee>" },
          transient: { display_id: "1234" }
        }
      },
      {
        header: { msg_type: "display_data" },
        content: {
          data: { "text/html": "<marquee>wee</marquee>" },
          transient: { display_id: "5555" }
        }
      },
      // Should not be processed
      {
        header: { msg_type: "ignored" },
        content: { data: { "text/html": "<marquee>wee</marquee>" } }
      },
      {
        header: { msg_type: "update_display_data" },
        content: {
          data: { "text/plain": "i am text" },
          transient: { display_id: "here" }
        }
      }
    ];

    const channels = from(messages);
    const action$ = of({
      type: actions.LAUNCH_KERNEL_SUCCESSFUL,
      payload: {
        kernel: {
          channels,
          cwd: "/home/tester",
          type: "websocket"
        },
        kernelRef: "fakeKernelRef",
        contentRef: "fakeContentRef",
        selectNextKernel: false
      }
    });

    const epic = updateDisplayEpic(action$);

    const responseActions = [];
    epic.subscribe(
      action => responseActions.push(action),
      err => {
        throw err;
      },
      () => {
        expect(responseActions).toEqual([
          actions.updateDisplay({
            content: {
              data: { "text/html": "<marquee>wee</marquee>" },
              transient: { display_id: "1234" }
            },
            contentRef: "fakeContentRef"
          }),
          actions.updateDisplay({
            content: {
              data: { "text/plain": "i am text" },
              transient: { display_id: "here" }
            },
            contentRef: "fakeContentRef"
          })
        ]);
        done();
      }
    );
  });
});

describe("sendInputReplyEpic", () => {
  it("does nothing if there is no active kernel", done => {
    const state = mockAppState({});
    const action$ = of(
      actions.sendInputReply({ contentRef: "noKernelForMe" })
    );
    const state$ = new StateObservable(new Subject(), state);
    const obs = sendInputReplyEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
  it("sends an input request to an active kernel", done => {
    const next = jest.fn();
    const state = {
      core: {
        entities: {
          contents: {
            byRef: Immutable.Map({
              testContentRef: stateModule
                .makeNotebookContentRecord()
                .setIn(["model", "kernelRef"], "fakeKernelRef")
            })
          },
          kernels: {
            byRef: Immutable.Map({
              fakeKernelRef: {
                channels: {
                  next
                }
              }
            })
          }
        }
      }
    };
    const contentRef = state.core.entities.contents.byRef.keySeq().first();
    const action$ = of(
      actions.sendInputReply({ contentRef })
    );
    const state$ = new StateObservable(new Subject(), state);
    const obs = sendInputReplyEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
    expect(next).toBeCalled();
  });
});
