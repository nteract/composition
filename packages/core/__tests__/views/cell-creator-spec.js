import React from "react";
import { shallow } from "enzyme";

import CellCreator from "../../src/components/cell-creator";

describe("CellCreatorView", () => {
  const createCell = jest.fn();
  const mergeCell = jest.fn();

  const setup = id =>
    shallow(
      <CellCreator
        createCell={createCell}
        mergeCell={mergeCell}
        above={false}
        id={id}
      />
    );

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
  test("clicking merge cell button invokes mergeCell", () => {
    const component = setup(null);
    component.find(".merge-cell").simulate("click");
    expect(mergeCell).toHaveBeenCalled();
  });
});
