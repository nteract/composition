import React from "react";

import { shallow } from "enzyme";

import { displayOrder, transforms } from "@nteract/transforms";
import { RichestMime } from "../";

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
    expect(rm.first().props()).toEqual({
      data: "THE DATA",
      theme: "light",
      metadata: "alright",
      expanded: false,
      models
    });
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
