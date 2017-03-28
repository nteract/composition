import React from "react";

import Text from "../src/text";

import renderer from "react-test-renderer";

test("Text renders plain text", () => {
  const tree = renderer.create(<Text data={"hey"} />).toJSON();
  expect(tree).toMatchSnapshot();
});
