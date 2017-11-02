import App from "./../../src/notebook/index.js";
import * as actions from "@nteract/core/actions";

import React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import { ipcRenderer as ipc } from "electron";

import { dummyCommutable, dummyJSON } from "dummy-nb";

describe("App", () => {
  it("renders app", () => {
    ipc.send = jest.fn();
    jest.spyOn(actions, "setNotificationSystem");
    const component = shallow(<App />);
    expect(toJson(component)).toMatchSnapshot();
    expect(ipc.send).toHaveBeenCalledWith("react-ready");
    expect(actions.setNotificationSystem).toHaveBeenCalled();
  });
});
