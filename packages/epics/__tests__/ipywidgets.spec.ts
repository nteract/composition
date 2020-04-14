import { toArray } from "rxjs/operators";
import Immutable from "immutable";

import { emptyCodeCell, appendCellToNotebook } from "@nteract/commutable";
import { actions, createContentRef, makeDocumentRecord } from "@nteract/core";
import { fixtureCommutable } from "@nteract/fixtures";

import { ipywidgetsModel$ } from "../src/ipywidgets";
import { from, Subject } from "rxjs";

const monocellDocument = makeDocumentRecord({
  notebook: appendCellToNotebook(fixtureCommutable, emptyCodeCell)
});

describe("ipywidgetsModel$", () => {
  test("emits AppendOutput if comm_open for LinkModel is sent", done => {
    const contentRef = createContentRef();
    const comm_id = "a_comm_id";
    const messages = [
      {
        header: { msg_type: "comm_open" },
        content: {
          comm_id,
          data: {
            state: {
              _model_name: "LinkModel"
            }
          }
        }
      }
    ];
    const kernel = { channels: from(messages) };
    const resultingActions = [];
    ipywidgetsModel$(kernel, monocellDocument, contentRef).subscribe(x =>
      resultingActions.push(x)
    );
    expect(resultingActions[1]).toEqual(
      actions.appendOutput({
        id: monocellDocument.getIn(["notebook", "cellOrder"]).first(),
        contentRef,
        output: {
          output_type: "display_data",
          data: {
            "application/vnd.jupyter.widget-view+json": {
              model_id: comm_id,
              version_major: 2,
              version_minor: 0
            }
          },
          metadata: {},
          transient: {}
        }
      })
    );
    expect(resultingActions).toHaveLength(2);
    done();
  });
  test("does not emit anything for non-comm open messages", done => {
    const contentRef = createContentRef();
    const comm_id = "a_comm_id";
    const messages = [
      {
        header: { msg_type: "display_data" },
        content: {
          comm_id,
          data: {
            state: {
              _model_name: "LinkModel"
            }
          }
        }
      }
    ];
    const kernel = { channels: from(messages) };
    const resultingActions = [];
    ipywidgetsModel$(kernel, monocellDocument, contentRef).subscribe(x =>
      resultingActions.push(x)
    );
    expect(resultingActions).toHaveLength(0);
    done();
  });

  test("on kernel error returns executeFailed action", done => {
    const contentRef = "fakeContentRef";
    const sent = new Subject();
    const received = new Subject();
    received.hasError = true;

    const mockSocket = Subject.create(sent, received);
    const kernel = { channels: mockSocket };
    const resultingActions = [];
    ipywidgetsModel$(kernel, monocellDocument, contentRef).subscribe(x =>
      resultingActions.push(x)
    );    
    expect(resultingActions).toEqual([
      {
        type: actions.EXECUTE_FAILED,
        error: true,
        payload: {
          code:"EXEC_WEBSOCKET_ERROR",
          contentRef: "fakeContentRef",
          error: new Error(
            "The WebSocket connection has unexpectedly disconnected."
            )
        }
      }
    ]);
    done();
  });

  test("does not emit an appendOutput for non-notebook types", done => {
    const contentRef = createContentRef();
    const comm_id = "a_comm_id";
    const messages = [
      {
        header: { msg_type: "comm_open" },
        content: {
          comm_id,
          data: {
            state: {
              _model_name: "LinkModel"
            }
          }
        }
      }
    ];
    const kernel = { channels: from(messages) };
    const resultingActions = [];
    ipywidgetsModel$(kernel, null, contentRef).subscribe(x =>
      resultingActions.push(x)
    );
    expect(resultingActions[1]).toBeNull();
    done();
  });
});
