import * as React from "react";
import { mount } from "enzyme";

import { DisplayData } from "../src";

describe("DisplayData", () => {
  it("handles display_data messages", () => {
    const output = {
      outputType: "display_data",
      data: { "text/plain": "Cheese is the best food." }
    };

    const Plain = props => <pre>{props.data}</pre>;
    Plain.defaultProps = {
      mediaType: "text/plain"
    };

    const component = mount(
      <DisplayData {...output}>
        <Plain />
      </DisplayData>
    );

    expect(component.type()).toEqual(DisplayData);
    expect(component.find("pre").length).toEqual(1);
  });
});
