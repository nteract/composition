import { mount, shallow } from "enzyme";
import * as React from "react";

import {
  DisplayData,
  ExecuteResult,
  KernelOutputError,
  Media,
  Output,
  RichMedia,
  StreamText
} from "../src";

describe("Output", () => {
  it("handles stream data", () => {
    const output = { output_type: "stream", name: "stdout", text: "hey" };

    const component = shallow(
      <Output output={output}>
        <StreamText />
      </Output>
    );

    expect(component.type()).toEqual(StreamText);
  });

  it("handles errors/tracebacks", () => {
    const output = {
      output_type: "error",
      traceback: ["Yikes, Will is in the upsidedown again!"],
      ename: "NameError",
      evalue: "Yikes!"
    };

    const component = shallow(
      <Output output={output}>
        <KernelOutputError />
      </Output>
    );

    expect(component.find("KernelOutputError")).not.toBeNull();

    const outputNoTraceback = {
      output_type: "error",
      ename: "NameError",
      evalue: "Yikes!"
    };

    const component2 = shallow(
      <Output output={outputNoTraceback}>
        <KernelOutputError />
      </Output>
    );
    expect(component2.find("KernelOutputError")).not.toBeNull();
  });
  it("handles display_data messages", () => {
    const output = {
      output_type: "display_data",
      data: { "text/plain": "Cheese is the best food." }
    };

    const Plain = props => <pre>{props.data}</pre>;
    Plain.defaultProps = {
      mediaType: "text/plain"
    };

    const component = shallow(
      <Output output={output}>
        <DisplayData>
          <Plain />
        </DisplayData>
      </Output>
    );

    expect(component.type()).toEqual(DisplayData);
  });
  it("handles an execute result message", () => {
    const output = {
      output_type: "execute_result",
      data: {
        "text/plain": "42 is the answer to life, the universe, and everything."
      }
    };

    const Plain = props => <pre>{props.data}</pre>;
    Plain.defaultProps = {
      mediaType: "text/plain"
    };

    const component = shallow(
      <Output output={output}>
        <ExecuteResult>
          <Plain />
        </ExecuteResult>
      </Output>
    );

    expect(component.type()).toEqual(ExecuteResult);
  });
});

describe("Full Outputs usage", () => {
  const testOutput = {
    output_type: "display_data",
    data: {
      "text/html": "<p>This is some HTML that <b>WILL</b> render</p>",
      "text/plain": "This is some plain text that WILL NOT render"
    },
    metadata: {}
  };

  function Usage(props) {
    // This example tests nested RichMedia usage, see #4250
    const richMedia = (
      <RichMedia>
        <Media.Json />
        <Media.HTML />
        <Media.Plain />
      </RichMedia>
    );

    return (
      <Output output={props.output}>
        <DisplayData>{richMedia}</DisplayData>
        <ExecuteResult>{richMedia}</ExecuteResult>
      </Output>
    );
  }

  const wrapper = mount(<Usage output={testOutput} />);

  test("<Output /> selects correct output to render based on output.displayType", () => {
    expect(wrapper.find(DisplayData).exists()).toEqual(true);
    expect(wrapper.find(ExecuteResult).exists()).toEqual(false);
  });

  test("Nested <RichMedia /> chooses the richest media type", () => {
    const chosen = wrapper.find(Media.HTML);
    expect(chosen.type()).toEqual(Media.HTML);
    expect(chosen.text()).toEqual("This is some HTML that WILL render");
  });
});

describe("Output with an array of output_types", () => {
  const displayOutput = {
    output_type: "display_data",
    data: {
      "text/html": "<p>This is some HTML that <b>WILL</b> render</p>",
      "text/plain": "This is some plain text that WILL NOT render"
    },
    metadata: {}
  };

  const executeResultOutput = Object.assign({}, displayOutput, {
    output_type: "execute_result"
  });

  const someOtherOutput = {
    output_type: "stream",
    name: "stdout",
    text: "hey"
  };

  function CompositeOutput(props) {
    const { output, children } = props;

    return (
      <RichMedia data={output.data} metadata={output.metadata}>
        {children}
      </RichMedia>
    );
  }
  CompositeOutput.defaultProps = {
    output: null,
    output_type: ["display_data", "execute_result"]
  };

  function Usage(props) {
    return (
      <Output output={props.output}>
        <CompositeOutput>
          <Media.Json />
          <Media.HTML />
          <Media.Plain />
        </CompositeOutput>
      </Output>
    );
  }

  it("should render if any output_type matches", () => {
    const wrapperDisplay = mount(<Usage output={displayOutput} />);
    const wrapperExecuteResult = mount(<Usage output={executeResultOutput} />);
    const wrapperOtherOutput = mount(<Usage output={someOtherOutput} />);

    expect(wrapperDisplay.find(Media.HTML).exists()).toEqual(true);
    expect(wrapperExecuteResult.find(Media.HTML).exists()).toEqual(true);
    expect(wrapperOtherOutput.html()).toEqual("");
  });
});
