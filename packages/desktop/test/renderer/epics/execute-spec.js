import { ActionsObservable } from "redux-observable";
import {
  EXECUTE_CELL,
  ABORT_EXECUTION,
  ERROR_EXECUTING,
  CLEAR_OUTPUTS,
  UPDATE_CELL_STATUS,
  UPDATE_CELL_PAGERS,
  UPDATE_DISPLAY,
  NEW_KERNEL
} from "@nteract/core/constants";

import { executeCell } from "@nteract/core/actions";
import {
  executeCellStream,
  executeCellEpic,
  updateDisplayEpic,
  createExecuteCellStream
} from "../../../src/notebook/epics/execute";

const Immutable = require("immutable");

import { Subject } from "rxjs/Subject";
import { from } from "rxjs/observable/from";
import { toArray, share, catchError, bufferCount } from "rxjs/operators";

const sinon = require("sinon");
const chai = require("chai");
const chaiImmutable = require("chai-immutable");

const expect = chai.expect;
chai.use(chaiImmutable);

describe("executeCell", () => {
  it("returns an executeCell action", () => {
    expect(
      executeCell("0-0-0-0", "import random; random.random()")
    ).to.deep.equal({
      type: EXECUTE_CELL,
      id: "0-0-0-0",
      source: "import random; random.random()"
    });
  });
});

describe("executeCellStream", () => {
  // TODO: Refactor executeCelStream into separate testable observables
  it("is entirely too insane for me to test this well right this second", done => {
    const frontendToShell = new Subject();
    const shellToFrontend = new Subject();
    const mockShell = Subject.create(frontendToShell, shellToFrontend);
    const mockIOPub = new Subject();

    const channels = { shell: mockShell, iopub: mockIOPub };

    // Expect message to have been sent
    frontendToShell.subscribe(msg => {
      expect(msg.header.msg_type).to.equal("execute_request");
      expect(msg.content.code).to.equal("import this");
    });

    const action$ = executeCellStream(channels, "0", "import this");

    action$.pipe(bufferCount(3)).subscribe(messages => {
      expect(messages).to.deep.equal([
        // TODO: Order doesn't actually matter here
        { type: UPDATE_CELL_PAGERS, id: "0", pagers: Immutable.List() },
        { type: UPDATE_CELL_STATUS, id: "0", status: "busy" },
        { type: CLEAR_OUTPUTS, id: "0" }
      ]);
      done(); // TODO: Make sure message check above is called
    });
  });

  it("outright rejects a lack of channels.shell and iopub", done => {
    const obs = executeCellStream({}, "0", "woo");
    obs.subscribe(null, err => {
      expect(err.message).to.equal("kernel not connected");
      done();
    });
  });
});

describe("createExecuteCellStream", () => {
  it("errors if the kernel is not connected in create", done => {
    const frontendToShell = new Subject();
    const shellToFrontend = new Subject();
    const mockShell = Subject.create(frontendToShell, shellToFrontend);
    const mockIOPub = new Subject();
    const store = {
      getState() {
        return this.state;
      },
      state: {
        app: {
          executionState: "not connected",
          channels: { iopub: mockIOPub, shell: mockShell },
          notificationSystem: { addNotification: sinon.spy() }
        }
      }
    };
    const action$ = ActionsObservable.of({ type: EXECUTE_CELL });
    const observable = createExecuteCellStream(action$, store, "source", "id");
    observable.pipe(toArray()).subscribe(
      actions => {
        const payloads = actions.map(({ payload }) => payload);
        expect(payloads).to.deep.equal(["Kernel not connected!"]);
      },
      () => expect.fail(),
      () => done()
    );
  });
  it("doesnt complete but does push until abort action", done => {
    const frontendToShell = new Subject();
    const shellToFrontend = new Subject();
    const mockShell = Subject.create(frontendToShell, shellToFrontend);
    const mockIOPub = new Subject();
    const store = {
      getState() {
        return this.state;
      },
      state: {
        app: {
          executionState: "connected",
          channels: { iopub: mockIOPub, shell: mockShell },
          notificationSystem: { addNotification: sinon.spy() }
        }
      }
    };
    const action$ = ActionsObservable.of(
      { type: EXECUTE_CELL, id: "id" },
      { type: EXECUTE_CELL, id: "id_2" },
      { type: ABORT_EXECUTION, id: "id_2" },
      { type: EXECUTE_CELL, id: "id" }
    );
    const observable = createExecuteCellStream(action$, store, "source", "id");
    const actionBuffer = [];
    observable.subscribe(
      x => actionBuffer.push(x.type),
      err => expect.fail(err, null)
    );
    expect(actionBuffer).to.deep.equal([
      UPDATE_CELL_PAGERS,
      UPDATE_CELL_STATUS,
      CLEAR_OUTPUTS
    ]);
    done();
  });
});

describe("executeCellEpic", () => {
  const store = {
    getState() {
      return this.state;
    },
    state: {
      app: {
        executionState: "idle",
        channels: "errorInExecuteCellObservable",
        notificationSystem: { addNotification: sinon.spy() },
        token: "blah"
      }
    }
  };
  it("Errors on a bad action", done => {
    // Make one hot action
    const badAction$ = ActionsObservable.of({ type: EXECUTE_CELL }).pipe(
      share()
    );
    const responseActions = executeCellEpic(badAction$, store).pipe(
      catchError(error => {
        expect(error.message).to.equal("execute cell needs an id");
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => {
        expect(x.type).to.equal(ERROR_EXECUTING);
        done();
      },
      err => expect.fail(err, null),
      () => {
        // It should not error in the stream
        expect.fail("It should not complete");
      }
    );
  });
  it("Errors on an action where source not a string", done => {
    const badAction$ = ActionsObservable.of(executeCell("id", 2)).pipe(share());
    const responseActions = executeCellEpic(badAction$, store).pipe(
      catchError(error => {
        expect(error.message).to.equal("execute cell needs source string");
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => {
        expect(x.type).to.equal(ERROR_EXECUTING);
        done();
      },
      err => expect.fail(err, null),
      () => {
        // It should not error in the stream
        expect.fail("The epic should not complete");
      }
    );
  });
  it("Informs about disconnected kernels, allows reconnection", done => {
    const action$ = ActionsObservable.of(executeCell("id", "source")).pipe(
      share()
    );
    const responseActions = executeCellEpic(action$, store);
    responseActions.subscribe(
      x => {
        expect(x.payload.toString()).to.equal("Error: kernel not connected");
        done();
      },
      err => expect.fail(err, null),
      () => {
        // It should not error in the stream
        expect.fail("the epic should not complete");
      }
    );
  });
});

describe("updateDisplayEpic", () => {
  it("creates an epic that handles update_display_data messages", done => {
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
    ]; // Should not be processed // Should be processed

    const channels = { iopub: from(messages) };
    const action$ = ActionsObservable.of({ type: NEW_KERNEL, channels });

    const epic = updateDisplayEpic(action$);

    const responseActions = [];
    epic.subscribe(
      action => responseActions.push(action),
      err => {
        throw err;
      },
      () => {
        expect(responseActions).to.deep.equal([
          {
            type: UPDATE_DISPLAY,
            output: {
              output_type: "display_data",
              data: { "text/html": "<marquee>wee</marquee>" },
              transient: { display_id: "1234" }
            }
          },
          {
            type: UPDATE_DISPLAY,
            output: {
              output_type: "display_data",
              data: { "text/plain": "i am text" },
              transient: { display_id: "here" }
            }
          }
        ]);
        done();
      }
    );
  });
});
