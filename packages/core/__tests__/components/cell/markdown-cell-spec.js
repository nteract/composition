import React from "react";

import { shallow, mount } from "enzyme";

import MarkdownCell from "../../../src/components/cell/markdown-cell";
import {
  focusCellEditor,
  focusPreviousCell,
  focusNextCell
} from "../../../actions";

import { emptyMarkdownCell } from "@nteract/commutable";
import { displayOrder, transforms } from "@nteract/transforms-full";
import { dummyStore } from "utils";

describe("MarkdownCell", () => {
  test("can be rendered", () => {
    const cell = shallow(
      <MarkdownCell
        cell={emptyMarkdownCell}
        {...{ displayOrder, transforms }}
      />
    );
    expect(cell).not.toBeNull();
  });

  test("toggles view mode with key events", () => {
    const store = dummyStore();
    store.dispatch = jest.fn();

    const cell = mount(
      <MarkdownCell
        id="1234"
        cell={emptyMarkdownCell}
        focusEditor={() => store.dispatch(focusCellEditor("1234"))}
        {...{ displayOrder, transforms }}
      />,
      { context: { store } }
    );

    // Starts in view mode
    expect(cell.state("view")).toBe(true);

    cell.simulate("keydown", { key: "Enter" });
    expect(cell.state("view")).toBe(false);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "FOCUS_CELL_EDITOR",
      id: "1234"
    });

    cell.simulate("keydown", { key: "Enter", shiftKey: true });
    // Stays in view mode on shift enter
    expect(cell.state("view")).toBe(true);
    // Enter key enters edit mode
    // Back to view mode
    cell.simulate("keydown", { key: "Enter", shiftKey: true });
    expect(cell.state("view")).toBe(true);
  });

  test("sets the state of the text based on cell source", () => {
    const cell = mount(
      <MarkdownCell
        cell={emptyMarkdownCell}
        {...{ displayOrder, transforms }}
      />
    );

    cell.setProps({ cell: emptyMarkdownCell.set("source", "test") });
    expect(cell.state("source")).toBe("test");
  });

  test("navigates to the previous cell with the up arrow key", () => {
    const store = dummyStore();
    store.dispatch = jest.fn();

    const cell = shallow(
      <MarkdownCell
        id="1234"
        cell={emptyMarkdownCell}
        focusAbove={() => store.dispatch(focusPreviousCell("1234"))}
        {...{ displayOrder, transforms }}
      />,
      { context: { store } }
    );

    cell.simulate("keydown", { key: "ArrowUp" });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: "FOCUS_PREVIOUS_CELL",
      id: "1234"
    });
  });

  test("navigates to the next cell with the down arrow key", () => {
    const store = dummyStore();
    store.dispatch = jest.fn();

    const cell = shallow(
      <MarkdownCell
        id="1234"
        cell={emptyMarkdownCell}
        focusBelow={() => store.dispatch(focusNextCell("1234", true))}
        {...{ displayOrder, transforms }}
      />,
      { context: { store } }
    );

    cell.simulate("keydown", { key: "ArrowDown" });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: "FOCUS_NEXT_CELL",
      id: "1234",
      createCellIfUndefined: true
    });
  });
});
