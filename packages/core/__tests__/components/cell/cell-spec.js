import React from "react";
import Immutable from "immutable";

import { mount } from "enzyme";

import { dummyStore } from "../../../src/dummy";
import { Cell } from "../../../src/components/cell/cell";

import { emptyCodeCell, emptyMarkdownCell } from "@nteract/commutable";

import { displayOrder, transforms } from "@nteract/transforms-full";

const sharedProps = { displayOrder, transforms };
describe("Cell", () => {
  test("should be able to render a markdown cell", () => {
    const store = dummyStore();
    const cell = mount(<Cell cell={emptyMarkdownCell} {...sharedProps} />, {
      context: { store }
    });
    expect(cell).not.toBeNull();
    expect(cell.find("div.cell.text").length).toBeGreaterThan(0);

    cell.update();

    cell.setProps({ cellFocused: "1", id: "1" });
  });
  test("should be able to render a code cell", () => {
    const store = dummyStore();
    const cell = mount(
      <Cell
        cell={emptyCodeCell}
        {...sharedProps}
        cellStatus={Immutable.Map({ outputHidden: false, inputHidden: false })}
        models={new Immutable.Map({})}
      />,
      {
        context: { store }
      }
    );
    expect(cell).not.toBeNull();
    expect(cell.find("div.code.cell").length).toBeGreaterThan(0);
  });
  test("dispatches cell actions", () => {
    const store = dummyStore();
    const cell = mount(<Cell cell={emptyMarkdownCell} {...sharedProps} />, {
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
