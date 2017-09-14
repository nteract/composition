import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/from";

import "rxjs/add/operator/pluck";
import "rxjs/add/operator/do";
import "rxjs/add/operator/count";
import "rxjs/add/operator/toPromise";

import { createMessage, getUsername } from "../";

describe("createMessage", () => {
  it("makes a msg", () => {
    const msg = createMessage("a", {
      parent_header: { msg_id: "100" },
      content: { data: { foo: "bar" } }
    });
    expect(typeof msg).toBe("object");
    expect(typeof msg.header).toBe("object");
    expect(typeof msg.content).toBe("object");
    expect(msg.header.username).toBe(getUsername());
    expect(msg.header.msg_type).toBe("a");
    expect(msg.parent_header.msg_id).toBe("100");
    expect(msg.content.data.foo).toBe("bar");
  });
});

describe("childOf", () => {
  it("filters messages that have the same parent", () =>
    Observable.from([
      { parent_header: { msg_id: "100" } },
      { parent_header: { msg_id: "100" } },
      { parent_header: { msg_id: "200" } },
      { parent_header: { msg_id: "300" } },
      { parent_header: { msg_id: "100" } }
    ])
      .childOf({ header: { msg_id: "100" } })
      .count()
      .toPromise()
      .then(val => {
        expect(val).toEqual(3);
      }));
  it("throws an error if msg_id is not present", done =>
    Observable.from([
      { parent_header: { msg_id_bad: "100" } },
      { parent_header: { msg_id_test: "100" } },
      { parent_header: { msg_id_invalid: "200" } },
      { parent_header: { msg_id_invalid: "300" } }
    ])
      .childOf({ header: { msg_id: "100" } })
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
    Observable.from([
      { header: { msg_type: "a" } },
      { header: { msg_type: "d" } },
      { header: { msg_type: "b" } },
      { header: { msg_type: "a" } },
      { header: { msg_type: "d" } }
    ])
      .ofMessageType(["a", "d"])
      .do(val => {
        expect(val.header.msg_type === "a" || val.header.msg_type === "d");
      })
      .pluck("header", "msg_type")
      .count()
      .toPromise()
      .then(val => {
        expect(val).toEqual(4);
      });
  });
  it("throws an error in msg_type is not present", done =>
    Observable.from([
      { header: { msg_type_invalid: "a" } },
      { header: { msg_type_invalid: "d" } },
      { header: {} },
      { header: { msg_type: "a" } }
    ])
      .ofMessageType(["a", "d"])
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
