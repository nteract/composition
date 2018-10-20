import React from "react";

import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import { displayOrder, transforms } from "@nteract/transforms";
import { RichestMime } from "../src";

describe("RichestMime", () => {
  it("renders a mimebundle", () => {
    const models = {};
    const rm = shallow(
      <RichestMime
        displayOrder={displayOrder}
        transforms={transforms}
        bundle={{ "text/plain": "THE DATA" }}
        metadata={{
          "text/plain": { alright: "alright alright", matthewMcconaughey: true }
        }}
        models={models}
      />
    );

    expect(toJson(rm)).toMatchSnapshot();
  });
  it("does not render unknown mimetypes", () => {
    const rm = shallow(
      <RichestMime
        displayOrder={displayOrder}
        transforms={transforms}
        bundle={{ "application/ipynb+json": "{}" }}
      />
    );

    expect(rm.type()).toBeNull;
  });
});
