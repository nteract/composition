import { mount } from "enzyme";
import Immutable from "immutable";
import React from "react";

import { Outputs } from "../../src/outputs";

describe("Outputs", () => {
  it("sets hidden class correctly based on props", () => {
    const component = mount(
      <Outputs
        id={"cellId"}
        contentRef={"contentRef"}
        hidden={true}
        expanded={false}
        outputs={Immutable.List()}
      >
        <p>test</p>
      </Outputs>
    );
    expect(component.find(".hidden").length).not.toBe(0);
  });
  it("sets expanded class correctly based on props", () => {
    const component = mount(
      <Outputs
        id={"cellId"}
        contentRef={"contentRef"}
        hidden={false}
        expanded={true}
        outputs={Immutable.List()}
      >
        <p>test</p>
      </Outputs>
    );
    expect(component.find(".expanded").length).not.toBe(0);
  });
});
