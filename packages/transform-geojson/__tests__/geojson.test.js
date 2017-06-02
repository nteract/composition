import React from "react";
import _ from "lodash";

import { mount } from "enzyme";

import GeoJSONTransform, { getTheme } from "../src";

function deepFreeze(obj) {
  // Retrieve the property names defined on obj
  const propNames = Object.getOwnPropertyNames(obj);

  // Freeze properties before freezing self
  propNames.forEach(name => {
    const prop = obj[name];

    // Freeze prop if it is an object
    if (typeof prop === "object" && prop !== null) {
      deepFreeze(prop);
    }
  });

  // Freeze self (no-op if already frozen)
  return Object.freeze(obj);
}

const geojson = deepFreeze({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        popupContent: "18th & California Light Rail Stop"
      },
      geometry: {
        type: "Point",
        coordinates: [-104.98999178409576, 39.74683938093904]
      }
    },
    {
      type: "Feature",
      properties: {
        popupContent: "20th & Welton Light Rail Stop"
      },
      geometry: {
        type: "Point",
        coordinates: [-104.98689115047453, 39.747924136466565]
      }
    }
  ]
});

const metadata = { expanded: true };

describe("GeoJSONTransform", () => {
  it("renders a map", () => {
    const geoComponent = mount(
      <GeoJSONTransform data={geojson} metadata={metadata} />
    );

    expect(
      geoComponent.instance().shouldComponentUpdate({
        theme: "light",
        data: geojson
      })
    ).toBeFalsy();
    expect(geoComponent.find(".leaflet-container").length).toBe(1);
  });

  it("updates the map", () => {
    const geoComponent = mount(
      <GeoJSONTransform data={geojson} metadata={metadata} />
    );

    const instance = geoComponent.instance();

    expect(
      instance.shouldComponentUpdate({
        theme: "light",
        data: geojson
      })
    ).toBeFalsy();

    expect(geoComponent.find(".leaflet-container").length).toBe(1);

    geoComponent.setProps({
      data: _.set(
        _.cloneDeep(geojson),
        ["features", 0, "properties", "popupContent"],
        "somewhere"
      ),
      theme: "dark"
    });
  });

  it("picks an appropriate theme when unknown", () => {
    expect(getTheme("light")).toEqual("light");
    expect(getTheme("dark")).toEqual("dark");

    const el = document.createElement("div");
    el.style.backgroundColor = "#FFFFFF";
    expect(getTheme("classic", el)).toEqual("light");

    const darkEl = document.createElement("div");
    darkEl.style.backgroundColor = "#000000";
    expect(getTheme("classic", darkEl)).toEqual("dark");
  });
});
