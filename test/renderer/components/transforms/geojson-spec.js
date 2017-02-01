import React from 'react';
import _ from 'lodash';

import { mount } from 'enzyme';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import GeoJSONTransform, { getTheme } from '../../../../src/notebook/components/transforms/geojson';

chai.use(sinonChai);

function deepFreeze(obj) {
  // Retrieve the property names defined on obj
  const propNames = Object.getOwnPropertyNames(obj);

  // Freeze properties before freezing self
  propNames.forEach((name) => {
    const prop = obj[name];

    // Freeze prop if it is an object
    if (typeof prop === 'object' && prop !== null) { deepFreeze(prop); }
  });

  // Freeze self (no-op if already frozen)
  return Object.freeze(obj);
}

const geojson = deepFreeze({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        popupContent: '18th & California Light Rail Stop',
      },
      geometry: {
        type: 'Point',
        coordinates: [-104.98999178409576, 39.74683938093904],
      },
    }, {
      type: 'Feature',
      properties: {
        popupContent: '20th & Welton Light Rail Stop',
      },
      geometry: {
        type: 'Point',
        coordinates: [-104.98689115047453, 39.747924136466565],
      },
    },
  ],
});

describe('GeoJSONTransform', () => {
  it('renders a map', () => {
    const geoComponent = mount(
      <GeoJSONTransform
        data={geojson}
      />,
    );

    expect(geoComponent.instance().shouldComponentUpdate({
      theme: 'light',
      data: geojson,
    })).to.be.false;
    expect(geoComponent.find('.leaflet-container')).to.have.length(1);
  });

  it('updates the map', () => {
    const geoComponent = mount(
      <GeoJSONTransform
        data={geojson}
      />,
    );

    const instance = geoComponent.instance();

    expect(instance.shouldComponentUpdate({
      theme: 'light',
      data: geojson,
    })).to.be.false;

    expect(geoComponent.find('.leaflet-container')).to.have.length(1);

    geoComponent.setProps({
      data: _.set(_.cloneDeep(geojson), ['features', 0, 'properties', 'popupContent'], 'somewhere'),
      theme: 'dark',
    });
  });
  it('picks an appropriate theme when unknown', () => {
    expect(getTheme('light')).to.equal('light');
    expect(getTheme('dark')).to.equal('dark');
    expect(getTheme('nteract')).to.equal('light');
    expect(getTheme()).to.equal('light');
  });
});
