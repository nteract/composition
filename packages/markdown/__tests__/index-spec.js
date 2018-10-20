// @flow

import * as React from "react";
import Markdown from "../src";

import { mount } from "enzyme";
import toJson from "enzyme-to-json";

const cases = [
  {
    source: `
# Watching Paint Dry

The composited _color_ of the **paint** must not change during drying. The
optical blending function is used with this constraint to compensate for the new
dry layer $C_{d}^{\prime}$, when some volume $\delta_{\alpha}$ is removed from
the wet layer.

$$
C_{d}^{\prime} = \\frac{\alpha}{}
$$

The dry layer of the canvas uses a relative height field to allow for unlimited
volume of paint to be added, with a constraint only on the relative change in
height between texels.
`,
    name: "watching-paint-dry"
  }
];

describe("markdown works as it should", () => {
  test("lets see", () => {
    cases.forEach(({ source, name }) => {
      const wrapper = mount(<Markdown source={source} />);
      expect(toJson(wrapper)).toMatchSnapshot(name);
    });
  });
});
