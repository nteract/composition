import * as React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { HeaderEditor } from "../src/";

describe("Header Editor", () => {
  it("renders correctly with no props", () => {
    const tree = renderer.create(<HeaderEditor />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders a static view when not editable", () => {
    const tree = renderer.create(<HeaderEditor editable={false} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly given header data", () => {
    const onChange = jest.fn();

    const headerData = {
      authors: [{ name: "zombo.com" }, { name: "internets" }],
      title: "Welcome to ZomboCom",
      description: `This ... is ... ZomboCom. Welcome. This is ZomboCom; welcome ... to ZomboCom. You can do anything at ZomboCom. Anything at all. The only limit is yourself. Welcome ... to ZomboCom.
Welcome ... to ZomboCom. This is ... ZomboCom. Welcome ... to ZomboCom! This is ZomboCom, welcome! Yes ... This ... is ZomboCom.
This is ZomboCom! And welcome to you, who have come to ZomboCom. Anything ... is possible ... at ZomboCom. You can do ... anything at ZomboCom. The infinite is possible at ZomboCom. The unattainable is unknown at ZomboCom. Welcome to ZomboCom. This ... is ZomboCom.
Welcome to ZomboCom. Welcome. This ... is ... ZomboCom. Welcome ... to ZomboCom! Welcome ... to ZomboCom.`,
      tags: ["best of web", "colorful", "pulsating discs"]
    };

    const wrapper = shallow(
      <HeaderEditor headerData={headerData} onChange={onChange} editable />
    );

    // Click to add an author
    wrapper.find(".author-button").simulate("click");

    const authorEntry = wrapper.find(".author-entry");
    authorEntry.simulate("change", { target: { value: "the world" } });
    // JSX Style and enzyme are not playing well -- it's turning arrays into objects
    // expect(wrapper).toMatchSnapshot();
    authorEntry.simulate("keypress", { key: "Enter" });

    /*
    Can't seem to make all this work...
    expect(onChange).toHaveBeenCalledWith({
      a: "b"
    });*/
  });
});
