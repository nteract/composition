import React from "react";
import Immutable from "immutable";

import { mount } from "enzyme";

import { dummyStore } from "../../../src/dummy";
import Cell from "../../../src/components/cell/cell";

import { emptyCodeCell, emptyMarkdownCell } from "@nteract/commutable";

describe("Cell", () => {
  test("should be able to render a markdown cell", () => {
    // TODO: This test is not _really_ testing anything other than exercising
    //       the code. We need more real tests here.
    const store = dummyStore();
    const cell = mount(<Cell cell={emptyMarkdownCell} />, {
      context: { store }
    });
    expect(cell).not.toBeNull();

    cell.update();

    cell.setProps({ cellFocused: "1", id: "1" });
  });
  test("should be able to render a code cell", () => {
    const store = dummyStore();
    const cell = mount(<Cell cell={emptyCodeCell} />, {
      context: { store }
    });
    expect(cell).not.toBeNull();
  });
  test("dispatches cell actions", () => {
    const store = dummyStore();
    const cell = mount(<Cell cell={emptyMarkdownCell} />, {
      context: { store }
    });

    store.dispatch = jest.fn();
    const inst = cell.instance();

    inst.selectCell();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "FOCUS_CELL",
      id: undefined
    });

    inst.focusAboveCell();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "FOCUS_PREVIOUS_CELL",
      id: undefined
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: "FOCUS_PREVIOUS_CELL_EDITOR",
      id: undefined
    });

    inst.focusBelowCell();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "FOCUS_NEXT_CELL",
      id: undefined,
      createCellIfUndefined: true
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "FOCUS_NEXT_CELL_EDITOR",
      id: undefined
    });
  });
});
