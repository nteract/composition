import Immutable from "immutable";

import { makeDisplayData } from "@nteract/commutable";

import { richestMediaType } from "../../src/outputs/transform-media";

describe("richestMediaType", () => {
  it("returns nothing if media type is not in display order", () => {
    const output = makeDisplayData({
      data: {
        "text/unsupported": "test"
      }
    });
    const handlers = Immutable.Map({
      "text/supported": props => <p>Test transform</p>
    });
    const order = Immutable.List(["text/supported"]);
    expect(richestMediaType(output, order, handlers)).toBeUndefined();
  });
  it("returns nothing if the media type has no supported transform", () => {
    const output = makeDisplayData({
      data: {
        "text/supported": "test"
      }
    });
    const handlers = Immutable.Map({
      "text/unsupported": props => <p>Test transform</p>
    });
    const order = Immutable.List(["text/supported"]);
    expect(richestMediaType(output, order, handlers)).toBeUndefined();
  });
  it("returns higher-priority media type for output", () => {
    const output = makeDisplayData({
      data: {
        "text/more-important": "another-test",
        "text/supported": "test"
      }
    });
    const handlers = Immutable.Map({
      "text/more-important": props => <p>Test transform</p>,
      "text/supported": props => <p>Test transform</p>
    });
    const order = Immutable.List(["text/more-important", "text/supported"]);
    expect(richestMediaType(output, order, handlers)).toBe(
      "text/more-important"
    );
  });
});
