import React from "react";

import { shallow } from "enzyme";

import { displayOrder, transforms } from "@nteract/transforms";
import { RichestMime } from "../";
import toJson from "enzyme-to-json";

describe("RichestMime", () => {
  it("renders a mimebundle", () => {
    const models = {};
    const rm = shallow(
      <RichestMime
        displayOrder={displayOrder}
        transforms={transforms}
        bundle={{ "text/plain": "THE DATA" }}
        metadata={{ "text/plain": "alright" }}
        models={models}
      />
    );

    expect(rm.instance().shouldComponentUpdate()).toBeTruthy();

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
