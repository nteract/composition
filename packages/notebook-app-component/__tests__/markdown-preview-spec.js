// @flow
import React from "react";
import { shallow, mount } from "enzyme";
import { emptyMarkdownCell } from "@nteract/commutable";

import MarkdownPreview from "../src/markdown-preview";


describe("MarkdownPreview ", () => {
  test("can be rendered", () => {
    const cell = shallow(<MarkdownPreview cell={emptyMarkdownCell} />);
    expect(cell).not.toBeNull();
  });

  test("toggles view mode with key events", () => {
    const focusEditor = jest.fn();

    const cell = mount(
      <MarkdownPreview
        id="1234"
        cell={emptyMarkdownCell}
        focusEditor={focusEditor}
      />
    );

    // Starts in view mode
    expect(cell.state("view")).toBe(true);

    cell.simulate("keydown", { key: "Enter" });
    expect(cell.state("view")).toBe(false);
    expect(focusEditor).toHaveBeenCalled();

    cell.simulate("keydown", { key: "Enter", shiftKey: true });
    // Stays in view mode on shift enter
    expect(cell.state("view")).toBe(true);
    // Enter key enters edit mode
    // Back to view mode
    cell.simulate("keydown", { key: "Enter", shiftKey: true });
    expect(cell.state("view")).toBe(true);
  });

  test("navigates to the previous cell with the up arrow key", () => {
    const focusAbove = jest.fn();

    const cell = shallow(
      <MarkdownPreview
        id="1234"
        cell={emptyMarkdownCell}
        focusAbove={focusAbove}
      />
    );

    cell.simulate("keydown", { key: "ArrowUp" });

    expect(focusAbove).toHaveBeenCalled();
  });

  test("navigates to the next cell with the down arrow key", () => {
    const focusBelow = jest.fn();

    const cell = shallow(
      <MarkdownPreview
        id="1234"
        cell={emptyMarkdownCell}
        focusBelow={focusBelow}
      />
    );

    cell.simulate("keydown", { key: "ArrowDown" });

    expect(focusBelow).toHaveBeenCalled();
  });
});
