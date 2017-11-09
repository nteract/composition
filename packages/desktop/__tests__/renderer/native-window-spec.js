import Immutable from "immutable";
import { remote } from "electron";

import { from } from "rxjs/observable/from";

import * as nativeWindow from "../../src/notebook/native-window";
import {
  AppRecord,
  DocumentRecord,
  MetadataRecord
} from "@nteract/core/records";

const path = require("path");

describe("tildify", () => {
  test("returns an empty string if given no path", () => {
    expect(nativeWindow.tildify()).toBe("");
  });
  test("replaces the user directory with ~", () => {
    const fixture = path.join(remote.app.getPath("home"), "test-notebooks");
    const result = nativeWindow.tildify(fixture);
    if (process.platform === "win32") {
      expect(result).toBe(fixture);
    } else {
      expect(result).toContain("~");
    }
  });
});

describe("setTitleFromAttributes", () => {
  test("sets the window title", () => {
    // Set up our "Electron window"
    const win = {
      setRepresentedFilename: jest.fn(),
      setDocumentEdited: jest.fn(),
      setTitle: jest.fn()
    };

    remote.getCurrentWindow = jest.fn();
    remote.getCurrentWindow.mockReturnValue(win);

    const titleObject = {
      fullpath: "/tmp/test.ipynb",
      executionState: "busy",
      modified: true
    };
    nativeWindow.setTitleFromAttributes(titleObject);

    expect(win.setTitle).toBeCalled();
  });
});

describe("createTitleFeed", () => {
  test("creates an observable that updates title attributes for modified notebook", done => {
    const notebook = new Immutable.Map().setIn(
      ["metadata", "kernelspec", "display_name"],
      "python3000"
    );
    const state = {
      document: DocumentRecord({
        notebook
      }),
      app: AppRecord({
        executionState: "not connected"
      }),
      metadata: MetadataRecord({ filename: "titled.ipynb" })
    };

    const state$ = from([state]);

    const allAttributes = [];
    nativeWindow.createTitleFeed(state$).subscribe(
      attributes => {
        allAttributes.push(attributes);
      },
      null,
      () => {
        expect(allAttributes).toEqual([
          {
            modified: process.platform === "darwin" ? true : false,
            fullpath: "titled.ipynb",
            executionState: "not connected"
          }
        ]);
        done();
      }
    );
  });

  test("creates an observable that updates title attributes", done => {
    const notebook = new Immutable.Map().setIn(
      ["metadata", "kernelspec", "display_name"],
      "python3000"
    );
    const state = {
      document: DocumentRecord({
        notebook,
        savedNotebook: notebook
      }),
      app: AppRecord({
        executionState: "not connected"
      }),
      metadata: MetadataRecord({ filename: "titled.ipynb" })
    };

    const state$ = from([state]);

    const allAttributes = [];
    nativeWindow.createTitleFeed(state$).subscribe(
      attributes => {
        allAttributes.push(attributes);
      },
      null,
      () => {
        expect(allAttributes).toEqual([
          {
            modified: false,
            fullpath: "titled.ipynb",
            executionState: "not connected"
          }
        ]);
        done();
      }
    );
  });
});
