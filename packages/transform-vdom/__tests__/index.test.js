import React from "react";
import TransformVDOM from "../src";
import renderer from "react-test-renderer";

test("VDOM Transform is cool", () => {
  const component = renderer.create(
    <TransformVDOM
      data={{
        tagName: "h1",
        attributes: {
          style: {
            color: "DeepPink"
          }
        },
        children: [
          {
            tagName: "img",
            attributes: {
              width: "100px",
              height: "100px",
              src: "about:blank"
            },
            children: []
          }
        ]
      }}
    />
  );
});
