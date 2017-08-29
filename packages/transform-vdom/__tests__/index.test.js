import React from "react";
import TransformVDOM from "../src";
import renderer from "react-test-renderer";

test("VDOM Transform is cool", () => {
  const component = renderer.create(
    <TransformVDOM
      data={{
        tagName: "div",
        attributes: {
          style: {
            color: "DeepPink"
          }
        },
        children: [
          {
            tagName: "h1",
            attributes: {},
            children: "Wahoo"
          },
          {
            tagName: "h1",
            attributes: {},
            children: null
          },
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
