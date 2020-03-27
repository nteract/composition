import Immutable from "immutable";

import { makeDisplayData } from "@nteract/commutable";
import { makeContentsRecord, state as types } from "@nteract/core";
import { mockAppState } from "@nteract/fixtures";

import {
  makeMapStateToProps,
  richestMediaType
} from "../../src/outputs/transform-media";

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

describe("makeMapStateToProps", () => {
  it("returns empty Media component for invalid output_types", () => {
    const state = mockAppState({});
    const ownProps = { output_type: "stream" };
    const result = makeMapStateToProps(state, ownProps)(state);
    expect(result.Media()).toBeNull();
  });
  it("returns an empty Media component for unregistered transforms", () => {
    const state = mockAppState({});
    const output = makeDisplayData({
      data: {
        "text/more-important": "another-test",
        "text/supported": "test"
      }
    });
    const ownProps = { output_type: "display_data", output };
    const result = makeMapStateToProps(state, ownProps)(state);
    expect(result.Media()).toBeNull();
  });
  it("returns an empty Media component for unregistered transforms", () => {
    const transform = jest.fn();
    const state = {
      config: Immutable.Map({}),
      core: types.makeStateRecord({
        entities: types.makeEntitiesRecord({
          transforms: types.makeTransformsRecord({
            displayOrder: Immutable.List(["text/supported"]),
            byId: Immutable.Map({
              "text/supported": transform
            })
          })
        })
      })
    };
    const output = makeDisplayData({
      data: {
        "text/more-important": "another-test",
        "text/supported": "test"
      }
    });
    const ownProps = { output_type: "display_data", output };
    const result = makeMapStateToProps(state, ownProps)(state);
    expect(result.Media).toBe(transform);
  });
});
