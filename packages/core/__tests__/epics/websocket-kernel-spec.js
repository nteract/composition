// @flow
import * as Immutable from "immutable";
import { ActionsObservable } from "redux-observable";
import { Subject } from "rxjs/Subject";
import { emptyNotebook } from "@nteract/commutable";
import { actions, state as stateModule, epics as coreEpics } from "../../src";
import { toArray } from "rxjs/operators";

describe("launchWebSocketKernelEpic", () => {
  test("launches remote kernels", async function() {
    const contentRef = stateModule.createContentRef();
    const kernelRef = "fake";

    const store = {
      getState() {
        return this.state;
      },
      state: {
        // $FlowFixMe
        app: stateModule.makeAppRecord({
          host: stateModule.makeJupyterHostRecord({
            type: "jupyter",
            token: "eh",
            serverUrl: "http://localhost:8888/"
          }),
          notificationSystem: { addNotification: jest.fn() }
        }),
        core: stateModule.makeStateRecord({
          kernelRef: "fake",
          entities: stateModule.makeEntitiesRecord({
            contents: stateModule.makeContentsRecord({
              byRef: Immutable.Map().set(
                contentRef,
                stateModule.makeNotebookContentRecord()
              )
            }),
            kernels: stateModule.makeKernelsRecord({
              byRef: Immutable.Map({
                fake: stateModule.makeRemoteKernelRecord({
                  type: "websocket",
                  channels: jest.fn(),
                  kernelSpecName: "fancy",
                  // $FlowFixMe: This is looking for real KernelId.
                  id: "0"
                })
              })
            })
          })
        })
      }
    };

    const action$ = ActionsObservable.of(
      actions.launchKernelByName({
        contentRef,
        kernelRef,
        kernelSpecName: "fancy",
        kernelType: "websocket",
        cwd: "/",
        selectNextKernel: true
      })
    );

    const responseActions = await coreEpics
      .launchWebSocketKernelEpic(action$, store)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: "LAUNCH_KERNEL_SUCCESSFUL",
        payload: {
          contentRef,
          kernelRef,
          selectNextKernel: true,
          kernel: {
            info: null,
            sessionId: "1",
            type: "websocket",
            channels: expect.any(Subject),
            kernelSpecName: "fancy",
            cwd: "/",
            id: "0"
          }
        }
      }
    ]);
  });
});

describe("interruptKernelEpic", () => {
  test("", async function() {
    const store = {
      getState() {
        return this.state;
      },
      state: {
        // $FlowFixMe
        core: stateModule.makeStateRecord({
          kernelRef: "fake",
          entities: stateModule.makeEntitiesRecord({
            kernels: stateModule.makeKernelsRecord({
              byRef: Immutable.Map({
                fake: stateModule.makeRemoteKernelRecord({
                  type: "websocket",
                  channels: jest.fn(),
                  kernelSpecName: "fancy",
                  // $FlowFixMe: This is looking for real KernelId.
                  id: "0"
                })
              })
            })
          })
        }),
        app: stateModule.makeAppRecord({
          host: stateModule.makeJupyterHostRecord({
            type: "jupyter",
            token: "eh",
            serverUrl: "http://localhost:8888/"
          }),
          notificationSystem: { addNotification: jest.fn() }
        })
      }
    };

    const action$ = ActionsObservable.of(actions.interruptKernel({}));

    const responseActions = await coreEpics
      .interruptKernelEpic(action$, store)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: "INTERRUPT_KERNEL_SUCCESSFUL",
        payload: {}
      }
    ]);
  });
});
