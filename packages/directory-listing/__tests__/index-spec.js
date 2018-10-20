// @flow
import * as React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import { Entry, Listing, Name, Icon, LastSaved } from "../src";

describe("Listing", () => {
  it("accepts props and renders entries in directory in a table", () => {
    const component = (
      <Listing>
        <Entry>
          <Icon fileType={"directory"} />
          <Name>{"linky"}</Name>
          <LastSaved
            last_modified={
              "Fri Jun 22 2018 00:15:55 GMT-0400 (Eastern Daylight Time)"
            }
          />
        </Entry>
      </Listing>
    );
    expect(toJson(component)).toMatchSnapshot();
  });
});

describe("Entry", () => {
  it("accepts props and renders entries in directory", () => {
    const component = shallow(
      <Entry>
        <Icon fileType={"directory"} />
        <Name>{"linky jr"}</Name>
        <LastSaved
          last_modified={
            "Fri Jun 22 2018 00:15:55 GMT-0400 (Eastern Daylight Time)"
          }
        />
      </Entry>
    );
    expect(toJson(component)).toMatchSnapshot();
  });
});
