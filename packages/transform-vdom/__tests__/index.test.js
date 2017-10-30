import React from "react";
import TransformVDOM from "../src";
import renderer from "react-test-renderer";

import { modelReplaceAttributes } from "../src/data-path";

test("VDOM Transform is cool", () => {
  const component = renderer.create(
    <TransformVDOM
      data={{
        tagName: "div",
        attributes: { style: { color: "DeepPink" } },
        children: [
          { tagName: "h1", attributes: {}, children: "Wahoo" },
          { tagName: "h1", attributes: {}, children: null },
          {
            tagName: "img",
            attributes: { width: "100px", height: "100px", src: "about:blank" },
            children: []
          }
        ]
      }}
    />
  );
});

test("data-path is sweet and I should write a better test description", () => {
  const attributes = {
    "data-path-for-value": "what",
    "data-path-meh": 12,
    "data-path-for-children": "mine",
    value: 3
  };

  const model = {
    what: 40,
    mine: "Hear ye, hear ye"
  };

  const obje = modelReplaceAttributes(model, {
    attributes: attributes,
    children: null
  });

  expect(obje).toEqual({
    attributes: {
      "data-path-for-children": "mine",
      "data-path-for-value": "what",
      "data-path-meh": 12,
      value: 40
    },
    children: {
      children: "Hear ye, hear ye"
    }
  });
});
