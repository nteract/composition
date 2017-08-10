import { expect } from "chai";
import { ActionsObservable } from "redux-observable";

import * as constants from "../../../src/notebook/constants";

import {
  setLanguageInfo,
  acquireKernelInfo,
  watchExecutionStateEpic,
  newKernelObservable,
  newKernelEpic,
  newKernelByNameEpic
} from "../../../src/notebook/epics/kernel-launch";

import { createMessage } from "@nteract/messaging";

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import "rxjs/add/observable/of";
import "rxjs/add/operator/toArray";

describe("setLanguageInfo", () => {
  it("creates a SET_LANGUAGE_INFO action", () => {
    const langInfo = {
      codemirror_mode: {
        name: "ipython",
        version: 3
      },
      file_extension: ".py",
      mimetype: "text/x-python",
      name: "python",
      nbconvert_exporter: "python",
      pygments_lexer: "ipython3",
      version: "3.5.1"
    };

    expect(setLanguageInfo(langInfo)).to.deep.equal({
      type: constants.SET_LANGUAGE_INFO,
      langInfo
    });
  });
});

describe("acquireKernelInfo", () => {
  it("sends a kernel_info_request and processes kernel_info_reply", done => {
    const sent = new Subject();
    const received = new Subject();

    const mockSocket = Subject.create(sent, received);

    sent.subscribe(msg => {
      expect(msg.header.msg_type).to.equal("kernel_info_request");

      const response = createMessage("kernel_info_reply");
      response.parent_header = msg.header;
      response.content = {
        language_info: {
          language: "python"
        }
      };

      // TODO: Get the Rx handling proper here
      setTimeout(() => received.next(response), 100);
    });

    const obs = acquireKernelInfo({ shell: mockSocket });

    obs.subscribe(langAction => {
      expect(langAction).to.deep.equal({
        langInfo: { language: "python" },
        type: constants.SET_LANGUAGE_INFO
      });
      done();
    });
  });
});

describe("watchExecutionStateEpic", () => {
  it("returns an Observable with an initial state of idle", done => {
    const action$ = ActionsObservable.of({
      type: constants.NEW_KERNEL,
      channels: {
        iopub: Observable.of({
          header: { msg_type: "status" },
          content: { execution_state: "idle" }
        })
      }
    });
    const obs = watchExecutionStateEpic(action$);
    obs.toArray().subscribe(
      // Every action that goes through should get stuck on an array
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).to.deep.equal([
          constants.SET_EXECUTION_STATE,
          constants.SET_EXECUTION_STATE
        ]);
      },
      () => expect.fail(), // It should not error in the stream
      () => done()
    );
  });
});

describe("newKernelObservable", () => {
  it("returns an observable", () => {
    const obs = newKernelObservable("python3", process.cwd());
    expect(obs.subscribe).to.not.be.null;
  });
});

describe("newKernelEpic", () => {
  it("throws an error if given a bad action", done => {
    const actionBuffer = [];
    const action$ = ActionsObservable.of({
      type: constants.LAUNCH_KERNEL
    }).share();
    const obs = newKernelEpic(action$);
    obs.subscribe(
      x => {
        expect(x.type).to.equal(constants.ERROR_KERNEL_LAUNCH_FAILED);
        actionBuffer.push(x.type);
        done();
      },
      err => expect.fail(err, null),
      () => {
        expect.fail("Should not complete");
      }
    );
  });
  it("calls newKernelObservable if given the correct action", done => {
    const actionBuffer = [];
    const action$ = ActionsObservable.of({
      type: constants.LAUNCH_KERNEL,
      kernelSpec: { spec: "hokey" },
      cwd: "~"
    });
    const obs = newKernelEpic(action$);
    obs.subscribe(
      x => {
        actionBuffer.push(x.type);
        if (actionBuffer.length === 2) {
          expect(actionBuffer).to.deep.equal([
            constants.SET_KERNEL_INFO,
            constants.NEW_KERNEL
          ]);
          done();
        }
      },
      err => expect.fail(err, null),
      () => {
        expect.fail();
      }
    );
  });
});

describe("newKernelByNameEpic", () => {
  it("creates a LAUNCH_KERNEL action in response to a LAUNCH_KERNEL_BY_NAME action", done => {
    const action$ = ActionsObservable.of({
      type: constants.LAUNCH_KERNEL_BY_NAME,
      kernelSpecName: "python3",
      cwd: "~"
    });
    const obs = newKernelByNameEpic(action$);
    obs.toArray().subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).to.deep.equal([constants.LAUNCH_KERNEL]);
      },
      err => expect.fail(err, null),
      () => done()
    );
  });
});
