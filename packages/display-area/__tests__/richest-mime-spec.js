import React from "react";
import Immutable from "immutable";

import { shallow } from "enzyme";

import { displayOrder, transforms } from "@nteract/transforms";
import { RichestMime } from "../";

describe("RichestMime", () => {
  it("renders a mimebundle", () => {
    const models = Immutable.fromJS({});
    const rm = shallow(
      <RichestMime
        displayOrder={displayOrder}
        transforms={transforms}
        bundle={Immutable.fromJS({ "text/plain": "THE DATA" })}
        metadata={Immutable.fromJS({ "text/plain": "alright" })}
        models={models}
      />
    );

    expect(rm.instance().shouldComponentUpdate()).toBeTruthy();
    expect(rm.first().props()).toEqual({
      data: "THE DATA",
      theme: "light",
      metadata: "alright",
      models
    });
  });
  it("does not render unknown mimetypes", () => {
    const rm = shallow(
      <RichestMime
        displayOrder={displayOrder}
        transforms={transforms}
        bundle={Immutable.fromJS({ "application/ipynb+json": "{}" })}
      />
    );

    expect(rm.type()).toBeNull;
  });
});
