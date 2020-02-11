import cloneDeep from "lodash.clonedeep";
import { from, of } from "rxjs";
import { count, map, tap, toArray } from "rxjs/operators";

import {
  childOf,
  convertOutputMessageToNotebookFormat,
  executeRequest,
  createMessage,
  createCommMessage,
  createCommOpenMessage,
  createCommCloseMessage,
  executionCounts,
  JupyterMessage,
  kernelStatuses,
  ofMessageType,
  outputs,
  payloads
} from "../src";
import {
  displayData,
  executeInput,
  executeReply,
  message,
  status
} from "../src/messages";

describe("createMessage", () => {
  it("makes a msg", () => {
    const msg = createMessage("execute_request", {
      parent_header: { msg_id: "100" },
      content: { data: { foo: "bar" } }
    });
    expect(typeof msg).toBe("object");
    expect(typeof msg.header).toBe("object");
    expect(typeof msg.content).toBe("object");
    expect(msg.header.msg_type).toBe("execute_request");
    expect(msg.parent_header.msg_id).toBe("100");
    expect(msg.content.data.foo).toBe("bar");
  });
});

describe("executeRequest", () => {
  it("creates an execute_request message", () => {
    const code = 'print("test")';
    const executeReq = executeRequest(code);

    expect(executeReq.content.code).toEqual(code);
    expect(executeReq.header.msg_type).toEqual("execute_request");
  });
});

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
    const commMessage = createCommOpenMessage(
      "0001",
      "myTarget",
      {
        hey: "is for horses"
      },
      "targetModule"
    );

    expect(commMessage.content).toEqual({
      comm_id: "0001",
      target_name: "myTarget",
      data: { hey: "is for horses" },
      target_module: "targetModule"
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

describe("childOf", () => {
  it("filters messages that have the same parent", () =>
    from([
      { parent_header: { msg_id: "100" } },
      { parent_header: { msg_id: "100" } },
      { parent_header: { msg_id: "200" } },
      { parent_header: { msg_id: "300" } },
      { parent_header: { msg_id: "100" } }
    ] as JupyterMessage[])
      .pipe(childOf({ header: { msg_id: "100" } } as JupyterMessage), count())
      .toPromise()
      .then(val => {
        expect(val).toEqual(3);
      }));
  // They now get logged instead if bad messages, instead of bombing the stream
  it.skip("throws an error if msg_id is not present", done =>
    from(([
      { parent_header: { msg_id_bad: "100" } },
      { parent_header: { msg_id_test: "100" } },
      { parent_header: { msg_id_invalid: "200" } },
      { parent_header: { msg_id_invalid: "300" } }
    ] as any[]) as JupyterMessage[])
      .pipe(childOf({ header: { msg_id: "100" } } as JupyterMessage))
      .subscribe(
        () => {
          throw new Error("Subscription was unexpectedly fulfilled.");
        },
        error => {
          expect(error).not.toBe(null);
          done();
        }
      ));
});

describe("ofMessageType", () => {
  it("filters messages of type requested", () => {
    from(([
      { header: { msg_type: "stream" } },
      { header: { msg_type: "error" } },
      { header: { msg_type: "status" } },
      { header: { msg_type: "stream" } },
      { header: { msg_type: "status" } }
    ] as any[]) as JupyterMessage[])
      .pipe(
        ofMessageType(["stream", "status"]),
        tap(val => {
          expect(
            val.header.msg_type === "stream" || val.header.msg_type === "error"
          );
        }),
        map(entry => entry.header.msg_type),
        count()
      )
      .toPromise()
      .then(val => {
        expect(val).toEqual(4);
      });
  });
  it("throws an error in msg_type is not present", done =>
    from(([
      { header: { msg_type_invalid: "stream" } },
      { header: { msg_type_invalid: "status" } },
      { header: {} },
      { header: { msg_type: "stream" } }
    ] as any[]) as JupyterMessage[])
      .pipe(ofMessageType(["stream", "status"]))
      .subscribe(
        () => {
          throw new Error("Subscription was unexpectedly fulfilled.");
        },
        error => {
          expect(error).not.toBe(null);
          done();
        }
      ));
  it("handles both the legacy and current arguments for ofMessageType", () => {
    from(([
      { header: { msg_type: "stream" } },
      { header: { msg_type: "error" } },
      { header: { msg_type: "status" } },
      { header: { msg_type: "stream" } },
      { header: { msg_type: "status" } }
    ] as any[]) as JupyterMessage[])
      .pipe(
        ofMessageType(["stream", "status"]),
        tap(val => {
          expect(
            val.header.msg_type === "stream" || val.header.msg_type === "status"
          );
        }),
        map(entry => entry.header.msg_type),
        count()
      )
      .toPromise()
      .then(val => {
        expect(val).toEqual(4);
      });

    from(([
      { header: { msg_type: "stream" } },
      { header: { msg_type: "status" } },
      { header: { msg_type: "error" } },
      { header: { msg_type: "stream" } },
      { header: { msg_type: "status" } }
    ] as any[]) as JupyterMessage[])
      .pipe(
        // Note the lack of array brackets on the arguments
        ofMessageType("stream", "status"),
        tap(val => {
          expect(
            val.header.msg_type === "stream" || val.header.msg_type === "status"
          );
        }),
        map(entry => entry.header.msg_type),
        count()
      )
      .toPromise()
      .then(val => {
        expect(val).toEqual(4);
      });
  });
});

describe("convertOutputMessageToNotebookFormat", () => {
  it("ensures that fields end up notebook format style", () => {
    const message = ({
      content: { yep: true },
      header: { msg_type: "test", msg_id: "10", username: "rebecca" },
      metadata: { purple: true }
    } as any) as JupyterMessage;

    expect(convertOutputMessageToNotebookFormat(message)).toEqual({
      yep: true,
      output_type: "test"
    });
  });

  it("should not mutate the message", () => {
    const message = ({
      content: { yep: true },
      header: { msg_type: "test", msg_id: "10", username: "rebecca" },
      metadata: { purple: true }
    } as any) as JupyterMessage;

    const copy = cloneDeep(message);
    convertOutputMessageToNotebookFormat(message);

    expect(message).toEqual(copy);
  });
});

describe("outputs", () => {
  it("extracts outputs as nbformattable contents", () => {
    const hacking = of(
      status("busy"),
      displayData({ data: { "text/plain": "woo" } }),
      displayData({ data: { "text/plain": "hoo" } }),
      status("idle")
    );

    return hacking
      .pipe(outputs(), toArray())
      .toPromise()
      .then(arr => {
        expect(arr).toEqual([
          {
            data: { "text/plain": "woo" },
            output_type: "display_data",
            metadata: {},
            transient: {}
          },
          {
            data: { "text/plain": "hoo" },
            output_type: "display_data",
            metadata: {},
            transient: {}
          }
        ]);
      });
  });
});

describe("payloads", () => {
  it("extracts payloads from execute_reply messages", () => {
    return of(
      status("idle"),
      status("busy"),
      executeReply({ payload: [{ c: "d" }] }),
      executeReply({ payload: [{ a: "b" }, { g: "6" }] }),
      executeReply({ status: "ok" }),
      message(
        { msg_type: "fake" as any },
        { payload: [{ should: "not be in it" }] }
      )
    )
      .pipe(payloads(), toArray())
      .toPromise()
      .then(arr => {
        expect(arr).toEqual([{ c: "d" }, { a: "b" }, { g: "6" }]);
      });
    expect(payloads()).toBeTruthy();
  });
});

describe("executionCounts", () => {
  it("extracts all execution counts from a session", () => {
    return of(
      status("starting"),
      status("idle"),
      status("busy"),
      executeInput({
        code: "display('woo')\ndisplay('hoo')",
        execution_count: 0
      }),
      displayData({ data: { "text/plain": "woo" } }),
      displayData({ data: { "text/plain": "hoo" } }),
      executeInput({
        code: "",
        execution_count: 1
      }),
      status("idle")
    )
      .pipe(executionCounts(), toArray())
      .toPromise()
      .then(arr => {
        expect(arr).toEqual([0, 1]);
      });
  });
  it("extracts all execution counts from a session", () => {
    return of(
      status("starting"),
      status("idle"),
      status("busy"),
      executeReply({
        status: "idle",
        execution_count: 0
      }),
      displayData({ data: { "text/plain": "woo" } }),
      displayData({ data: { "text/plain": "hoo" } }),
      executeReply({
        status: "idle",
        execution_count: 1
      }),
      status("idle")
    )
      .pipe(executionCounts(), toArray())
      .toPromise()
      .then(arr => {
        expect(arr).toEqual([0, 1]);
      });
  });
});

describe("kernelStatuses", () => {
  it("extracts all the execution states from status messages", () => {
    return of(
      status("starting"),
      status("idle"),
      status("busy"),
      displayData({ data: { "text/plain": "woo" } }),
      displayData({ data: { "text/plain": "hoo" } }),
      status("idle")
    )
      .pipe(kernelStatuses(), toArray())
      .toPromise()
      .then(arr => {
        expect(arr).toEqual(["starting", "idle", "busy", "idle"]);
      });
  });
});
