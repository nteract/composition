import React from "react";

import { shallow } from "enzyme";

import Output from "../src/output";
import RichestMime from "../src/richest-mime";

const Ansi = require("ansi-to-react");

describe("Output", () => {
  it("handles display data", () => {
    const output = {
      output_type: "display_data",
      data: {
        "text/html": "<h1>Multiple</h1>",
        "text/plain": "<IPython.core.display.HTML object>"
      },
      metadata: {}
    };

    const component = shallow(<Output output={output} />);
    expect(component.type()).toEqual(RichestMime);
    expect(component.first().props().bundle).toEqual(output.data);
  });
  it("handles execute_component", () => {
    const output = {
      data: {
        "text/html": [
          '<img src="https://avatars2.githubusercontent.com/u/12401040?v=3&s=200"/>'
        ],
        "text/plain": ["<IPython.core.display.Image object>"]
      },
      execution_count: 7,
      metadata: {},
      output_type: "execute_result"
    };

    const component = shallow(<Output output={output} />);
    expect(component.type()).toEqual(RichestMime);
    expect(component.first().props().bundle).toEqual(output.data);
  });
  it("handles stream data", () => {
    const output = {
      output_type: "stream",
      name: "stdout",
      text: "hey"
    };

    const component = shallow(<Output output={output} />);
    expect(component.type()).toEqual(Ansi);
  });
  it("handles errors/tracebacks", () => {
    const output = {
      output_type: "error",
      traceback: ["whoa there buckaroo!"],
      ename: "BuckarooException",
      evalue: "whoa!"
    };

    const component = shallow(<Output output={output} />);
    expect(component.type()).toEqual(Ansi);

    const outputNoTraceback = {
      output_type: "error",
      ename: "BuckarooException",
      evalue: "whoa!"
    };

    const component2 = shallow(<Output output={outputNoTraceback} />);
    expect(component2.type()).toEqual(Ansi);
  });
});
