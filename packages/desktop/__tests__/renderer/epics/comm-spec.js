import {
  createCommMessage,
  createCommCloseMessage,
  createCommOpenMessage,
  createCommErrorAction,
  commOpenAction,
  commMessageAction,
  commActionObservable
} from "../../../src/notebook/epics/comm";

import { COMM_OPEN, COMM_MESSAGE, COMM_ERROR } from "@nteract/core/constants";

import { of } from "rxjs/observable/of";
import { toArray } from "rxjs/operators";

describe("createCommMessage", () => {
  test("creates a comm_msg", () => {
    const commMessage = createCommMessage("0000", { hey: "is for horses" });

    expect(commMessage.content.data).toEqual({ hey: "is for horses" });
    expect(commMessage.content.comm_id).toBe("0000");
    expect(commMessage.header.msg_type).toBe("comm_msg");
  });
});

describe("createCommOpenMessage", () => {
  test("creates a comm_open", () => {
    const commMessage = createCommOpenMessage("0001", "myTarget", {
      hey: "is for horses"
    });

    expect(commMessage.content).toEqual({
      comm_id: "0001",
      target_name: "myTarget",
      data: { hey: "is for horses" }
    });
  });
  test("can specify a target_module", () => {
    const commMessage = createCommOpenMessage(
      "0001",
      "myTarget",
      { hey: "is for horses" },
      "Dr. Pepper"
    );

    expect(commMessage.content).toEqual({
      comm_id: "0001",
      target_name: "myTarget",
      data: { hey: "is for horses" },
      target_module: "Dr. Pepper"
    });
  });
});

describe("createCommCloseMessage", () => {
  test("creates a comm_msg", () => {
    const parent_header = { id: "23" };

    const commMessage = createCommCloseMessage(parent_header, "0000", {
      hey: "is for horses"
    });

    expect(commMessage.content.data).toEqual({ hey: "is for horses" });
    expect(commMessage.content.comm_id).toBe("0000");
    expect(commMessage.header.msg_type).toBe("comm_close");
    expect(commMessage.parent_header).toEqual(parent_header);
  });
});

describe("createCommErrorAction", () => {
  test("creates a COMM_ERROR action with an error", () => {
    const err = new Error();
    return createCommErrorAction(err)
      .toPromise()
      .then(action => {
        expect(action.type).toBe(COMM_ERROR);
        expect(action.payload).toBe(err);
        expect(action.error).toBe(true);
      });
  });
});

describe("commOpenAction", () => {
  test("creates a COMM_OPEN action", () => {
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

    expect(action).toEqual({
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
  test("creates a COMM_MESSAGE action", () => {
    const message = {
      content: { data: "DATA", comm_id: "0123" },
      buffers: new Uint8Array()
    };
    const action = commMessageAction(message);

    expect(action).toEqual({
      type: COMM_MESSAGE,
      data: "DATA",
      comm_id: "0123",
      buffers: new Uint8Array()
    });
  });
});

describe("commActionObservable", () => {
  test("emits COMM_OPEN and COMM_MESSAGE given the right messages", done => {
    const commOpenMessage = {
      header: { msg_type: "comm_open" },
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
      header: { msg_type: "comm_msg" },
      content: { data: "DATA", comm_id: "0123" },
      buffers: new Uint8Array()
    };

    const newKernelAction = {
      channels: { iopub: of(commOpenMessage, commMessage) }
    };

    commActionObservable(newKernelAction)
      .pipe(toArray())
      .subscribe(
        actions => {
          expect(actions).toEqual([
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
        err => expect.fail(err, null),
        () => done()
      ); // It should not error in the stream
  });
});
