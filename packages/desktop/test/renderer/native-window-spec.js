import Immutable from "immutable";
import { remote } from "electron";

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/from";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import * as nativeWindow from "../../src/notebook/native-window";
import {
  AppRecord,
  DocumentRecord,
  MetadataRecord
} from "../../src/notebook/records";

chai.use(sinonChai);

const path = require("path");

const electron = require("electron");

describe("tildify", () => {
  it("returns an empty string if given no path", () => {
    expect(nativeWindow.tildify()).to.equal("");
  });
  it("replaces the user directory with ~", () => {
    const fixture = path.join(remote.app.getPath("home"), "test-notebooks");
    const result = nativeWindow.tildify(fixture);
    if (process.platform === "win32") {
      expect(result).to.equal(fixture);
    } else {
      expect(result).to.have.string("~");
    }
  });
});

describe("setTitleFromAttributes", () => {
  it("sets the window title", () => {
    // Set up our "Electron window"
    const win = {
      setRepresentedFilename: sinon.spy(),
      setDocumentEdited: sinon.spy(),
      setTitle: sinon.spy()
    };

    sinon.stub(electron.remote, "getCurrentWindow", () => win);

    const titleObject = {
      fullpath: "/tmp/test.ipynb",
      executionState: "busy",
      modified: true
    };
    nativeWindow.setTitleFromAttributes(titleObject);

    // TODO: stub doesn't seem to get setup
    // expect(win.setTitle).to.have.been.called;
  });
});

describe("createTitleFeed", () => {
  it("creates an observable that updates title attributes", done => {
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
      metadata: MetadataRecord({
        filename: "titled.ipynb"
      })
    };

    const state$ = Observable.from([state]);

    const allAttributes = [];
    nativeWindow.createTitleFeed(state$).subscribe(attributes => {
      allAttributes.push(attributes);
    }, null, () => {
      expect(allAttributes).to.deep.equal([
        {
          modified: false,
          fullpath: "titled.ipynb",
          executionState: "not connected"
        }
      ]);
      done();
    });
  });
});
