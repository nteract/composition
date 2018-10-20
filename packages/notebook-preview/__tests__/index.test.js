import React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import { displayOrder, transforms } from "@nteract/transforms";

import NotebookPreview from "./../src";

import { dummyCommutable, dummyJSON } from "../../core/src/dummy";

// In order to get reproducable snapshots we need to mock the uuid package
jest.mock("uuid/v4", () => {
  let uuid = 1;
  return jest.fn(() => uuid++);
});

describe("Notebook", () => {
  it("accepts an Immutable.List of cells", () => {
    const component = shallow(
      <NotebookPreview
        notebook={dummyCommutable}
        theme="light"
        tip
        displayOrder={displayOrder}
        transforms={transforms}
      />
    );
    expect(toJson(component)).toMatchSnapshot();
  });

  it("accepts an Object of cells", () => {
    const component = shallow(
      <NotebookPreview
        notebook={dummyJSON}
        theme="light"
        tip
        displayOrder={displayOrder}
        transforms={transforms}
      />
    );
    expect(toJson(component)).toMatchSnapshot();
  });
});
