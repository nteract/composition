// @flow
import React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

// In order to get reproducible snapshots we need to mock the uuid package
jest.mock("uuid", () => {
  let uuid: number = 1;
  return {
    v4: jest.fn(() => uuid++)
  };
});

import { displayOrder, transforms } from "@nteract/transforms";

import NotebookPreview from "./../src";

import { dummyCommutable, dummyJSON } from "../../core/src/dummy";

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
