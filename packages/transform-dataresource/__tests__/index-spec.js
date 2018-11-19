import React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import DataExplorer from "../src/index";

const dataExplorerProps = {
  data: {
    schema: {
      fields: [
        { name: "index", type: "integer" },
        { name: "Country", type: "string" },
        { name: "Region", type: "string" },
        { name: "Happiness Rank", type: "integer" },
        { name: "Happiness Score", type: "number" },
        { name: "Standard Error", type: "number" },
        { name: "Economy (GDP per Capita)", type: "number" },
        { name: "Family", type: "number" },
        { name: "Health (Life Expectancy)", type: "number" },
        { name: "Freedom", type: "number" },
        { name: "Trust (Government Corruption)", type: "number" },
        { name: "Generosity", type: "number" },
        { name: "Dystopia Residual", type: "number" }
      ],
      primaryKey: ["index"],
      pandas_version: "0.20.0"
    },
    data: [
      {
        index: 0,
        Country: "Switzerland",
        Region: "Western Europe",
        "Happiness Rank": 1,
        "Happiness Score": 7.587,
        "Standard Error": 0.03411,
        "Economy (GDP per Capita)": 1.39651,
        Family: 1.34951,
        "Health (Life Expectancy)": 0.94143,
        Freedom: 0.66557,
        "Trust (Government Corruption)": 0.41978,
        Generosity: 0.29678,
        "Dystopia Residual": 2.51738
      },
      {
        index: 1,
        Country: "Iceland",
        Region: "Western Europe",
        "Happiness Rank": 2,
        "Happiness Score": 7.561,
        "Standard Error": 0.04884,
        "Economy (GDP per Capita)": 1.30232,
        Family: 1.40223,
        "Health (Life Expectancy)": 0.94784,
        Freedom: 0.62877,
        "Trust (Government Corruption)": 0.14145,
        Generosity: 0.4363,
        "Dystopia Residual": 2.70201
      },
      {
        index: 2,
        Country: "Denmark",
        Region: "Western Europe",
        "Happiness Rank": 3,
        "Happiness Score": 7.527,
        "Standard Error": 0.03328,
        "Economy (GDP per Capita)": 1.32548,
        Family: 1.36058,
        "Health (Life Expectancy)": 0.87464,
        Freedom: 0.64938,
        "Trust (Government Corruption)": 0.48357,
        Generosity: 0.34139,
        "Dystopia Residual": 2.49204
      },
      {
        index: 3,
        Country: "Norway",
        Region: "Western Europe",
        "Happiness Rank": 4,
        "Happiness Score": 7.522,
        "Standard Error": 0.0388,
        "Economy (GDP per Capita)": 1.459,
        Family: 1.33095,
        "Health (Life Expectancy)": 0.88521,
        Freedom: 0.66973,
        "Trust (Government Corruption)": 0.36503,
        Generosity: 0.34699,
        "Dystopia Residual": 2.46531
      },
      {
        index: 4,
        Country: "Canada",
        Region: "North America",
        "Happiness Rank": 5,
        "Happiness Score": 7.427,
        "Standard Error": 0.03553,
        "Economy (GDP per Capita)": 1.32629,
        Family: 1.32261,
        "Health (Life Expectancy)": 0.90563,
        Freedom: 0.63297,
        "Trust (Government Corruption)": 0.32957,
        Generosity: 0.45811,
        "Dystopia Residual": 2.45176
      },
      {
        index: 5,
        Country: "Finland",
        Region: "Western Europe",
        "Happiness Rank": 6,
        "Happiness Score": 7.406,
        "Standard Error": 0.0314,
        "Economy (GDP per Capita)": 1.29025,
        Family: 1.31826,
        "Health (Life Expectancy)": 0.88911,
        Freedom: 0.64169,
        "Trust (Government Corruption)": 0.41372,
        Generosity: 0.23351,
        "Dystopia Residual": 2.61955
      },
      {
        index: 6,
        Country: "Netherlands",
        Region: "Western Europe",
        "Happiness Rank": 7,
        "Happiness Score": 7.378,
        "Standard Error": 0.02799,
        "Economy (GDP per Capita)": 1.32944,
        Family: 1.28017,
        "Health (Life Expectancy)": 0.89284,
        Freedom: 0.61576,
        "Trust (Government Corruption)": 0.31814,
        Generosity: 0.4761,
        "Dystopia Residual": 2.4657
      },
      {
        index: 7,
        Country: "Sweden",
        Region: "Western Europe",
        "Happiness Rank": 8,
        "Happiness Score": 7.364,
        "Standard Error": 0.03157,
        "Economy (GDP per Capita)": 1.33171,
        Family: 1.28907,
        "Health (Life Expectancy)": 0.91087,
        Freedom: 0.6598,
        "Trust (Government Corruption)": 0.43844,
        Generosity: 0.36262,
        "Dystopia Residual": 2.37119
      },
      {
        index: 8,
        Country: "New Zealand",
        Region: "Australia and New Zealand",
        "Happiness Rank": 9,
        "Happiness Score": 7.286,
        "Standard Error": 0.03371,
        "Economy (GDP per Capita)": 1.25018,
        Family: 1.31967,
        "Health (Life Expectancy)": 0.90837,
        Freedom: 0.63938,
        "Trust (Government Corruption)": 0.42922,
        Generosity: 0.47501,
        "Dystopia Residual": 2.26425
      }
    ]
  },
  metadata: {
    dx: {
      view: "scatter",
      lineType: "line",
      areaType: "hexbin",
      selectedDimensions: [],
      selectedMetrics: [],
      pieceType: "bar",
      summaryType: "violin",
      networkType: "force",
      hierarchyType: "dendrogram",
      colors: [
        "#DA752E",
        "#E5C209",
        "#1441A0",
        "#B86117",
        "#4D430C",
        "#1DB390",
        "#B3331D",
        "#088EB2",
        "#417505",
        "#E479A8",
        "#F9F39E",
        "#5782DC",
        "#EBA97B",
        "#A2AB60",
        "#B291CF",
        "#8DD2C2",
        "#E6A19F",
        "#3DC7E0",
        "#98CE5B"
      ],
      chart: {
        metric1: "Happiness Rank",
        metric2: "Standard Error",
        metric3: "Happiness Score",
        dim1: "Region",
        dim2: "Country",
        dim3: "none",
        timeseriesSort: "array-order"
      }
    }
  },
  theme: "light",
  models: {},
  height: 500,
  mediaType: "application/vnd.dataresource+json"
};

describe("DataExplorerNoMetadata", () => {
  it("creates a data explorer with metadata", () => {
    const wrapper = shallow(<DataExplorer {...dataExplorerProps} />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});

describe("DataExplorerMetadata", () => {
  it("creates a data explorer without metadata", () => {
    const wrapper = shallow(
      <DataExplorer {...dataExplorerProps} metadata={{}} />
    );

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
