import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import { Provider } from "react-redux";

import Toolbar from "../../../src/notebook/providers/toolbar";
import { dummyStore } from "../../utils";

import {
  TOGGLE_STICKY_CELL,
  REMOVE_CELL,
  EXECUTE_CELL,
  CLEAR_OUTPUTS,
  CHANGE_INPUT_VISIBILITY,
  CHANGE_OUTPUT_VISIBILITY,
  CHANGE_CELL_TYPE,
  TOGGLE_OUTPUT_EXPANSION
} from "../../../src/notebook/constants";

describe.skip("toolbar provider", () => {
  const store = dummyStore();
  const dropdown = { hide: () => {} };

  const setup = props =>
    mount(
      <Provider store={store}>
        <Toolbar {...props} />
      </Provider>
    );

  it("toggle Sticky Cell works", done => {
    const dispatch = action => {
      expect(action.id).to.equal("cell");
      expect(action.type).to.equal(TOGGLE_STICKY_CELL);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .toggleStickyCell();
  });

  it("Remove Cell works", done => {
    const dispatch = action => {
      expect(action.id).to.equal("cell");
      expect(action.type).to.equal(REMOVE_CELL);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ type: "code", id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .removeCell();
  });

  it("execute cell works", done => {
    const dispatch = action => {
      expect(action.id).to.equal("cell");
      expect(action.source).to.equal("source");
      expect(action.type).to.equal(EXECUTE_CELL);
      done();
    };
    store.dispatch = dispatch;
    const func = args => args;
    const cell = { get: func };
    const toolbar = setup({ id: "cell", cell });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .executeCell();
  });

  it("clear outputs works", done => {
    const dispatch = action => {
      expect(action.id).to.equal("cell");
      expect(action.type).to.equal(CLEAR_OUTPUTS);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .clearOutputs(dropdown);
  });

  it("change Input Visibility works", done => {
    const dispatch = action => {
      expect(action.id).to.equal("cell");
      expect(action.type).to.equal(CHANGE_INPUT_VISIBILITY);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .changeInputVisibility(dropdown);
  });

  it("change Output Visibility works", done => {
    const dispatch = action => {
      expect(action.id).to.equal("cell");
      expect(action.type).to.equal(CHANGE_OUTPUT_VISIBILITY);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .changeOutputVisibility(dropdown);
  });

  it("change Cell Type works", done => {
    const dispatch = action => {
      expect(action.id).to.equal("cell");
      expect(action.to).to.equal("markdown");
      expect(action.type).to.equal(CHANGE_CELL_TYPE);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell", type: "code" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .changeCellType(dropdown);
  });

  it("toggle output expansion works", done => {
    const dispatch = action => {
      expect(action.id).to.equal("cell");
      expect(action.type).to.equal(TOGGLE_OUTPUT_EXPANSION);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .toggleOutputExpansion(dropdown);
  });
});
