import React from "react";

import { shallow } from "enzyme";
import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import StatusBar from "../../../src/notebook/components/status-bar";
import { dummyCommutable } from "../dummy-nb";

chai.use(sinonChai);

describe("StatusBar", () => {
  it("can render on a dummyNotebook", () => {
    const lastSaved = new Date();
    const kernelSpecDisplayName = "python3";

    const component = shallow(
      <StatusBar
        notebook={dummyCommutable}
        lastSaved={lastSaved}
        kernelSpecDisplayName={kernelSpecDisplayName}
      />
    );

    expect(component).to.not.be.null;
  });
  it("no update if an irrelevant prop has changed", () => {
    const lastSaved = new Date();
    const kernelSpecDisplayName = "python3";
    const shouldComponentUpdate = sinon.spy(
      StatusBar.prototype,
      "shouldComponentUpdate"
    );

    const component = shallow(
      <StatusBar
        notebook={dummyCommutable}
        lastSaved={lastSaved}
        kernelSpecDisplayName={kernelSpecDisplayName}
      />
    );

    component.setProps({
      lastSaved,
      kernelSpecDisplayName: "javascript",
      notebook: dummyCommutable
    });
    expect(shouldComponentUpdate).to.have.been.called;
    expect(shouldComponentUpdate).to.have.returned(false);
    shouldComponentUpdate.restore();
  });
  it("update if an irrelevant prop has changed", () => {
    const lastSaved = new Date();
    const kernelSpecDisplayName = "python3";
    const shouldComponentUpdate = sinon.spy(
      StatusBar.prototype,
      "shouldComponentUpdate"
    );

    const component = shallow(
      <StatusBar
        notebook={dummyCommutable}
        lastSaved={lastSaved}
        kernelSpecDisplayName={kernelSpecDisplayName}
      />
    );

    component.setProps({
      lastSaved: new Date(),
      kernelSpecDisplayName: "python3",
      notebook: dummyCommutable
    });
    expect(shouldComponentUpdate).to.have.been.called;
    expect(shouldComponentUpdate).to.have.returned(true);
    shouldComponentUpdate.restore();
  });
});
