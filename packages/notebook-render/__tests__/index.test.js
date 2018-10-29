import React from "react";
import ReactDOMServer from "react-dom/server";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import { displayOrder, transforms } from "@nteract/transforms";

import { dummyCommutable, dummyJSON } from "../../core/src/dummy";

import NotebookRender from "./../src";

// In order to get reproducable snapshots we need to mock the uuid package
jest.mock("uuid/v4", () => {
  let uuid = 1;
  return jest.fn(() => uuid++);
});

describe("Test NotebokRender snapshots", () => {
  it("accepts an Immutable.List of cells", () => {
    const component = shallow(
      <NotebookRender
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
      <NotebookRender
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

describe("Render server-side with renderToStaticMarkup", () => {
  it("html fragment shouldn't be empty", () => {
    const component = shallow(
      <NotebookRender
        notebook={dummyJSON}
        theme="light"
        tip
        displayOrder={displayOrder}
        transforms={transforms}
      />
    );
    const html = ReactDOMServer.renderToStaticMarkup(component);

    expect(html.length).toBeGreaterThan(0);
  });
});
