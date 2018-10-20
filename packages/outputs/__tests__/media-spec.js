import * as React from "react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";

import renderer from "react-test-renderer";

import { Media } from "../src";

describe("HTML", () => {
  it("renders direct HTML", () => {
    const component = mount(<Media.HTML data={"<b>cats are best</b>"} />);
    expect(toJson(component)).toMatchSnapshot();
  });
  it("updates the underlying HTML when data changes", () => {
    const component = mount(<Media.HTML data={"<b>cats are best</b>"} />);
    component.setProps({ data: "<b>squirrels are pretty great, too</b>" });
    expect(toJson(component)).toMatchSnapshot();
  });
});

describe("<JSON />;", () => {
  const population = {
    total_population: [
      { date: "2018-10-13", population: 329499086 },
      { date: "2018-10-14", population: 329505562 }
    ]
  };

  it("renders JSON data", () => {
    const component = renderer
      .create(<Media.JSON data={population} />)
      .toJSON();
    expect(component).toMatchSnapshot();
  });

  it("updates the theme if it changes", () => {
    const component = renderer
      .create(<Media.JSON data={population} theme={"dark"} />)
      .toJSON();
    expect(component).toMatchSnapshot();
  });
});

describe("<SVG />", () => {
  it("renders SVG data", () => {
    const data = `<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="96"
        height="20"
      >
        <linearGradient id="b" x2="0" y2="100%">
          <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
          <stop offset="1" stop-opacity=".1" />
        </linearGradient>
        <clipPath id="a">
          <rect width="96" height="20" rx="3" fill="#fff" />
        </clipPath>
        <g clip-path="url(#a)">
          <path fill="#555" d="M0 0h47v20H0z" />
          <path fill="#8518f2" d="M47 0h49v20H47z" />
          <path fill="url(#b)" d="M0 0h96v20H0z" />
        </g>
        <g
          fill="#fff"
          text-anchor="middle"
          font-family="DejaVu Sans,Verdana,Geneva,sans-serif"
          font-size="110"
        >
          <text
            x="245"
            y="150"
            fill="#010101"
            fill-opacity=".3"
            transform="scale(.1)"
            textLength="370"
          >
            launch
          </text>
          <text x="245" y="140" transform="scale(.1)" textLength="370">
            launch
          </text>
          <text
            x="705"
            y="150"
            fill="#010101"
            fill-opacity=".3"
            transform="scale(.1)"
            textLength="390"
          >
            nteract
          </text>
          <text x="705" y="140" transform="scale(.1)" textLength="390">
            nteract
          </text>
        </g>
      </svg>`;
    const component = mount(<Media.SVG data={data} />);
    expect(toJson(component)).toMatchSnapshot();
  });
});

describe("Markdown", () => {
  it("Should render markdown", () => {
    const data = "# Header";
    const component = mount(<Media.Markdown data={data} />);
    expect(toJson(component)).toMatchSnapshot();
  });
});

describe("Plain", () => {
  it("Should render markdown", () => {
    const data = "The text in Spain is mainly plain";
    const component = mount(<Media.Plain data={data} />);
    expect(toJson(component)).toMatchSnapshot();
  });
});
