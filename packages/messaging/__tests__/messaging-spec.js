import { from, of } from "rxjs";
import { map, tap, count, toArray } from "rxjs/operators";
import { ofMessageType, childOf } from "../src/index";

import {
  createMessage,
  createExecuteRequest,
  convertOutputMessageToNotebookFormat,
  outputs,
  payloads,
  executionCounts,
  kernelStatuses
} from "../src";

import {
  executeInput,
  displayData,
  updateDisplayData,
  executeResult,
  error,
  stream,
  status,
  executeReply,
  message
} from "../src/messages";

import { cloneDeep } from "lodash";

describe("createMessage", () => {
  it("makes a msg", () => {
    const msg = createMessage("a", {
      parent_header: { msg_id: "100" },
      content: { data: { foo: "bar" } }
    });
    expect(typeof msg).toBe("object");
    expect(typeof msg.header).toBe("object");
    expect(typeof msg.content).toBe("object");
    expect(msg.header.msg_type).toBe("a");
    expect(msg.parent_header.msg_id).toBe("100");
    expect(msg.content.data.foo).toBe("bar");
  });
});

describe("createExecuteRequest", () => {
  it("creates an execute_request message", () => {
    const code = 'print("test")';
    const executeRequest = createExecuteRequest(code);

    expect(executeRequest.content.code).toEqual(code);
    expect(executeRequest.header.msg_type).toEqual("execute_request");
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
    ])
      .pipe(
        childOf({ header: { msg_id: "100" } }),
        count()
      )
      .toPromise()
      .then(val => {
        expect(val).toEqual(3);
      }));
  // They now get logged instead if bad messages, instead of bombing the stream
  it.skip("throws an error if msg_id is not present", done =>
    from([
      { parent_header: { msg_id_bad: "100" } },
      { parent_header: { msg_id_test: "100" } },
      { parent_header: { msg_id_invalid: "200" } },
      { parent_header: { msg_id_invalid: "300" } }
    ])
      .pipe(childOf({ header: { msg_id: "100" } }))
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
    from([
      { header: { msg_type: "a" } },
      { header: { msg_type: "d" } },
      { header: { msg_type: "b" } },
      { header: { msg_type: "a" } },
      { header: { msg_type: "d" } }
    ])
      .pipe(
        ofMessageType(["a", "d"]),
        tap(val => {
          expect(val.header.msg_type === "a" || val.header.msg_type === "d");
        }),
        // pluck("header", "msg_type"),
        map(
          entry =>
            entry.header && entry.header.msg_type
              ? entry.header.msg_type
              : undefined
        ),
        count()
      )
      .toPromise()
      .then(val => {
        expect(val).toEqual(4);
      });
  });
  it("throws an error in msg_type is not present", done =>
    from([
      { header: { msg_type_invalid: "a" } },
      { header: { msg_type_invalid: "d" } },
      { header: {} },
      { header: { msg_type: "a" } }
    ])
      .pipe(ofMessageType(["a", "d"]))
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
    from([
      { header: { msg_type: "a" } },
      { header: { msg_type: "d" } },
      { header: { msg_type: "b" } },
      { header: { msg_type: "a" } },
      { header: { msg_type: "d" } }
    ])
      .pipe(
        ofMessageType(["a", "d"]),
        tap(val => {
          expect(val.header.msg_type === "a" || val.header.msg_type === "d");
        }),
        // pluck("header", "msg_type"),
        map(
          entry =>
            entry.header && entry.header.msg_type
              ? entry.header.msg_type
              : undefined
        ),
        count()
      )
      .toPromise()
      .then(val => {
        expect(val).toEqual(4);
      });

    from([
      { header: { msg_type: "a" } },
      { header: { msg_type: "d" } },
      { header: { msg_type: "b" } },
      { header: { msg_type: "a" } },
      { header: { msg_type: "d" } }
    ])
      .pipe(
        // Note the lack of array brackets on the arguments
        ofMessageType("a", "d"),
        tap(val => {
          expect(val.header.msg_type === "a" || val.header.msg_type === "d");
        }),
        // pluck("header", "msg_type"),
        map(
          entry =>
            entry.header && entry.header.msg_type
              ? entry.header.msg_type
              : undefined
        ),
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
    const message = {
      content: { yep: true },
      header: { msg_type: "test", msg_id: "10", username: "rebecca" },
      metadata: { purple: true }
    };

    expect(convertOutputMessageToNotebookFormat(message)).toEqual({
      yep: true,
      output_type: "test"
    });
  });

  it("should not mutate the message", () => {
    const message = {
      content: { yep: true },
      header: { msg_type: "test", msg_id: "10", username: "rebecca" },
      metadata: { purple: true }
    };

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
      .pipe(
        outputs(),
        toArray()
      )
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
      message({ msg_type: "fake" }, { payload: [{ should: "not be in it" }] })
    )
      .pipe(
        payloads(),
        toArray()
      )
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
      .pipe(
        executionCounts(),
        toArray()
      )
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
      .pipe(
        kernelStatuses(),
        toArray()
      )
      .toPromise()
      .then(arr => {
        expect(arr).toEqual(["starting", "idle", "busy", "idle"]);
      });
  });
});
