import {
  createCommMessage,
  createCommCloseMessage,
  createCommOpenMessage,
  createCommErrorAction,
  commOpenAction,
  commMessageAction,
  commActionObservable
} from "../../../src/notebook/epics/comm";

import {
  COMM_OPEN,
  COMM_MESSAGE,
  COMM_ERROR
} from "../../../src/notebook/constants";

const chai = require("chai");

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/toArray";

const expect = chai.expect;

describe("createCommMessage", () => {
  it("creates a comm_msg", () => {
    const commMessage = createCommMessage("0000", { hey: "is for horses" });

    expect(commMessage.content.data).to.deep.equal({ hey: "is for horses" });
    expect(commMessage.content.comm_id).to.equal("0000");
    expect(commMessage.header.msg_type).to.equal("comm_msg");
  });
});

describe("createCommOpenMessage", () => {
  it("creates a comm_open", () => {
    const commMessage = createCommOpenMessage("0001", "myTarget", {
      hey: "is for horses"
    });

    expect(commMessage.content).to.deep.equal({
      comm_id: "0001",
      target_name: "myTarget",
      data: { hey: "is for horses" }
    });
  });
  it("can specify a target_module", () => {
    const commMessage = createCommOpenMessage(
      "0001",
      "myTarget",
      { hey: "is for horses" },
      "Dr. Pepper"
    );

    expect(commMessage.content).to.deep.equal({
      comm_id: "0001",
      target_name: "myTarget",
      data: { hey: "is for horses" },
      target_module: "Dr. Pepper"
    });
  });
});

describe("createCommCloseMessage", () => {
  it("creates a comm_msg", () => {
    const parent_header = { id: "23" };

    const commMessage = createCommCloseMessage(parent_header, "0000", {
      hey: "is for horses"
    });

    expect(commMessage.content.data).to.deep.equal({ hey: "is for horses" });
    expect(commMessage.content.comm_id).to.equal("0000");
    expect(commMessage.header.msg_type).to.equal("comm_close");
    expect(commMessage.parent_header).to.deep.equal(parent_header);
  });
});

describe("createCommErrorAction", () => {
  it("creates a COMM_ERROR action with an error", () => {
    const err = new Error();
    return createCommErrorAction(err).toPromise().then(action => {
      expect(action.type).to.equal(COMM_ERROR);
      expect(action.payload).to.equal(err);
      expect(action.error).to.be.true;
    });
  });
});

describe("commOpenAction", () => {
  it("creates a COMM_OPEN action", () => {
    const message = {
      content: {
        data: "DATA",
        metadata: "0",
        comm_id: "0123",
        target_name: "daredevil",
        target_module: "murdock"
      },
      buffers: new Uint8Array()
    };
    const action = commOpenAction(message);

    expect(action).to.deep.equal({
      type: COMM_OPEN,
      data: "DATA",
      metadata: "0",
      comm_id: "0123",
      target_name: "daredevil",
      target_module: "murdock",
      buffers: new Uint8Array()
    });
  });
});

describe("commMessageAction", () => {
  it("creates a COMM_MESSAGE action", () => {
    const message = {
      content: {
        data: "DATA",
        comm_id: "0123"
      },
      buffers: new Uint8Array()
    };
    const action = commMessageAction(message);

    expect(action).to.deep.equal({
      type: COMM_MESSAGE,
      data: "DATA",
      comm_id: "0123",
      buffers: new Uint8Array()
    });
  });
});

describe("commActionObservable", () => {
  it("emits COMM_OPEN and COMM_MESSAGE given the right messages", done => {
    const commOpenMessage = {
      header: {
        msg_type: "comm_open"
      },
      content: {
        data: "DATA",
        metadata: "0",
        comm_id: "0123",
        target_name: "daredevil",
        target_module: "murdock"
      },
      buffers: new Uint8Array()
    };

    const commMessage = {
      header: {
        msg_type: "comm_msg"
      },
      content: {
        data: "DATA",
        comm_id: "0123"
      },
      buffers: new Uint8Array()
    };

    const newKernelAction = {
      channels: {
        iopub: Observable.of(commOpenMessage, commMessage)
      }
    };

    commActionObservable(newKernelAction).toArray().subscribe(
      actions => {
        expect(actions).to.deep.equal([
          {
            type: COMM_OPEN,
            data: "DATA",
            metadata: "0",
            comm_id: "0123",
            target_name: "daredevil",
            target_module: "murdock",
            buffers: new Uint8Array()
          },
          {
            type: COMM_MESSAGE,
            data: "DATA",
            comm_id: "0123",
            buffers: new Uint8Array()
          }
        ]);
      },
      err => expect.fail(err, null), // It should not error in the stream
      () => done()
    );
  });
});
