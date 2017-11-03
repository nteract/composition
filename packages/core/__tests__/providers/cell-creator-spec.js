// @flow
import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";

import CellCreator from "../../src/providers/cell-creator";
import { dummyStore } from "../../src/dummy";
import {
  NEW_CELL_AFTER,
  NEW_CELL_BEFORE,
  NEW_CELL_APPEND,
  MERGE_CELL_AFTER
} from "../../constants";

describe("CellCreatorProvider", () => {
  const store = dummyStore();

  const setup = (above, id) =>
    mount(
      <Provider store={store}>
        <CellCreator above={above} id={id} />
      </Provider>
    );

  test("can be constructed", () => {
    const component = setup(false, "test");
    expect(component).not.toBeNull();
  });
  test("createCell can create text cell", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).toBe("test");
        expect(action.cellType).toBe("markdown");
        expect(action.type).toBe(NEW_CELL_AFTER);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("markdown");
    }));
  test("createCell can create code cell", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).toBe("test");
        expect(action.cellType).toBe("code");
        expect(action.type).toBe(NEW_CELL_AFTER);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("code");
    }));
  test("createCell can add a cell above the current one", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).toBe("test");
        expect(action.cellType).toBe("code");
        expect(action.type).toBe(NEW_CELL_BEFORE);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(true, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("code");
    }));
  test("createCell creates a new cell if cell has no id", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.cellType).toBe("code");
        expect(action.type).toBe(NEW_CELL_APPEND);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, null);
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("code");
    }));
  test("mergeCell merges two cells into one", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).toBe("test");
        expect(action.type).toBe(MERGE_CELL_AFTER);
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
