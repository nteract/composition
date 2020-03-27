import { mount } from "enzyme";
import * as React from "react";

import { DisplayData } from "../src";

import { makeDisplayData } from "@nteract/commutable";

describe("DisplayData", () => {
  it("handles display_data messages", () => {
    const output = makeDisplayData({
      output_type: "display_data",
      data: { "text/plain": "Cheese is the best food." }
    });

    const Plain = props => <pre>{props.data}</pre>;
    Plain.defaultProps = {
      mediaType: "text/plain"
    };

    const component = mount(
      <DisplayData output={output}>
        <Plain />
      </DisplayData>
    );

    expect(component.type()).toEqual(DisplayData);
    expect(component.find("pre").length).toEqual(1);
  });
});
