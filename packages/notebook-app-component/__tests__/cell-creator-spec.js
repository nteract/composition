// @flow
import React from "react";
import { mount, shallow } from "enzyme";
import { Provider } from "react-redux";
import { actionTypes } from "@nteract/core";
import { dummyStore } from "@nteract/core/dummy";

import CellCreator, { PureCellCreator } from "../src/cell-creator";

describe("CellCreatorView", () => {
  const createCell = jest.fn();

  const setup = id =>
    shallow(<PureCellCreator createCell={createCell} above={false} id={id} />);

  test("can be constructed", () => {
    const component = setup("test");
    expect(component).not.toBeNull();
  });
  test("creates cell creator buttons if no cells exist", () => {
    const component = setup(null);
    const buttons = component.find(".cell-creator");
    expect(buttons).toHaveLength(1);
  });
  test("has create text cell button", () => {
    const component = setup(null);
    expect(component.find(".add-text-cell").length).toBeGreaterThan(0);
  });
  test("has create code cell button", () => {
    const component = setup(null);
    expect(component.find(".add-code-cell").length).toBeGreaterThan(0);
  });
  test("clicking text cell button invokes createCell", () => {
    const component = setup(null);
    component.find(".add-text-cell").simulate("click");
    expect(createCell).toHaveBeenCalledWith("markdown");
  });
  test("clicking code cell button invokes createCell", () => {
    const component = setup(null);
    component.find(".add-code-cell").simulate("click");
    expect(createCell).toHaveBeenCalledWith("code");
  });
});

describe("CellCreatorProvider", () => {
  test("can be constructed", () => {
    const store = dummyStore();

    const setup = (above, id) =>
      mount(
        <Provider store={store}>
          <CellCreator above={above} id={id} />
        </Provider>
      );

    const component = setup(false, "test");
    expect(component).not.toBeNull();
  });
  test("createCell can create text cell", () => {
    const store = dummyStore();

    const setup = (above, id) =>
      mount(
        <Provider store={store}>
          <CellCreator above={above} id={id} />
        </Provider>
      );

    return new Promise(resolve => {
      const dispatch = action => {
        expect(action.payload.id).toBe("test");
        expect(action.payload.cellType).toBe("markdown");
        expect(action.type).toBe(actionTypes.CREATE_CELL_BELOW);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("markdown");
    });
  });
  test("createCell can create code cell", () => {
    const store = dummyStore();

    const setup = (above, id) =>
      mount(
        <Provider store={store}>
          <CellCreator above={above} id={id} />
        </Provider>
      );

    return new Promise(resolve => {
      const dispatch = action => {
        expect(action.payload.id).toBe("test");
        expect(action.payload.cellType).toBe("code");
        expect(action.type).toBe(actionTypes.CREATE_CELL_BELOW);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("code");
    });
  });
  test("createCell can add a cell above the current one", () => {
    const store = dummyStore();

    const setup = (above, id) =>
      mount(
        <Provider store={store}>
          <CellCreator above={above} id={id} />
        </Provider>
      );

    return new Promise(resolve => {
      const dispatch = action => {
        expect(action.payload.id).toBe("test");
        expect(action.payload.cellType).toBe("code");
        expect(action.type).toBe(actionTypes.CREATE_CELL_ABOVE);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(true, "test");
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("code");
    });
  });
  test("createCell creates a new cell if cell has no id", () => {
    const store = dummyStore();

    const setup = (above, id) =>
      mount(
        <Provider store={store}>
          <CellCreator above={above} id={id} />
        </Provider>
      );

    return new Promise(resolve => {
      const dispatch = action => {
        expect(action.payload.cellType).toBe("code");
        expect(action.type).toBe(actionTypes.CREATE_CELL_APPEND);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup(false, null);
      const createCell = wrapper
        .findWhere(n => n.prop("createCell") !== undefined)
        .prop("createCell");
      createCell("code");
    });
  });
});
