// @flow

import React from "react";
import renderer from "react-test-renderer";
import { PureNewNotebookNavigation } from "../src/new-notebook-navigation";

import * as Immutable from "immutable";

describe("NewNotebookNavigation", () => {
  test("snapshots", () => {
    const availableNotebooks = [
      {
        kernelspec: {
          name: "python3",
          language: "python",
          displayName: "Python 3",
          metadata: Immutable.Map(),
          env: Immutable.Map(),
          argv: Immutable.List(),
          resources: Immutable.Map(),
          interruptMode: "yes"
        }
      },
      {
        kernelspec: {
          name: "scala211",
          language: "scala",
          displayName: "Scala 2.11",
          metadata: Immutable.Map(),
          env: Immutable.Map(),
          argv: Immutable.List(),
          resources: Immutable.Map(),
          interruptMode: "yes"
        }
      },
      {
        kernelspec: {
          name: "python2",
          language: "python",
          displayName: "Python 2",
          metadata: Immutable.Map(),
          env: Immutable.Map(),
          argv: Immutable.List(),
          resources: Immutable.Map(),
          interruptMode: "yes"
        }
      }
    ];

    const selectKernelspec = jest.fn();

    const component = renderer.create(
      <PureNewNotebookNavigation
        availableNotebooks={availableNotebooks}
        onClick={selectKernelspec}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
