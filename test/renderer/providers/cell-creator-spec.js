import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import { Provider } from "react-redux";

import CellCreator from "../../../src/notebook/providers/cell-creator";
import { dummyStore } from "../../utils";
import {
  NEW_CELL_AFTER,
  NEW_CELL_BEFORE,
  NEW_CELL_APPEND,
  MERGE_CELL_AFTER
} from "../../../src/notebook/constants";

describe("CellCreatorProvider", () => {
  const store = dummyStore();

  const setup = (above, id) =>
    mount(
      <Provider store={store}>
        <CellCreator above={above} id={id} />
      </Provider>
    );

  it("can be constructed", () => {
    const component = setup(false, "test");
    expect(component).to.not.be.null;
  });
  it("createCell can create text cell", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).to.equal("test");
        expect(action.cellType).to.equal("markdown");
        expect(action.type).to.equal(NEW_CELL_AFTER);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("markdown");
    }));
  it("createCell can create code cell", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).to.equal("test");
        expect(action.cellType).to.equal("code");
        expect(action.type).to.equal(NEW_CELL_AFTER);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("code");
    }));
  it("createCell can add a cell above the current one", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).to.equal("test");
        expect(action.cellType).to.equal("code");
        expect(action.type).to.equal(NEW_CELL_BEFORE);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(true, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("code");
    }));
  it("createCell creates a new cell if cell has no id", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.cellType).to.equal("code");
        expect(action.type).to.equal(NEW_CELL_APPEND);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, null);
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("code");
    }));
  it("mergeCell merges two cells into one", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).to.equal("test");
        expect(action.type).to.equal(MERGE_CELL_AFTER);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("mergeCell") !== undefined)
        .prop("mergeCell");
      createCell("code");
    }));
});
