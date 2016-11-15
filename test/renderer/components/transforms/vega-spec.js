import React from 'react';

import { shallow, mount } from 'enzyme';

import Immutable from 'immutable';

const chai = require('chai');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const expect = chai.expect;

const sinon = require('sinon');

import {
  Vega,
  VegaLite,
  VegaEmbed,
} from '../../../../src/notebook/components/transforms/vega';

const cars = require('vega-lite/data/cars.json');

const spec = Immutable.fromJS({
  "description": "A scatterplot showing horsepower and miles per gallons.",
  "data": {
    "values": cars,
  },
  "mark": "point",
  "encoding": {
    "x": {"field": "Horsepower", "type": "quantitative"},
    "y": {"field": "Miles_per_Gallon", "type": "quantitative"},
    "color": {"field": "Origin", "type": "nominal"},
    "shape": {"field": "Origin", "type": "nominal"}
  }
});

describe('Vega', () => {
  it('renders VegaEmbed with embedMode vega', () => {
    const wrapper = shallow(
      <Vega data={spec} />
    );

    expect(wrapper.name()).to.equal('VegaEmbed');
    expect(wrapper.props().embedMode).to.equal('vega');
  });
});

describe('VegaLite', () => {
  it('renders VegaEmbed with embedMode vega-lite', () => {
    const wrapper = shallow(
      <VegaLite data={spec} />
    );

    expect(wrapper.name()).to.equal('VegaEmbed');
    expect(wrapper.props().embedMode).to.equal('vega-lite');
  });
});

describe('VegaEmbed', () => {
  it('embeds vega', () => {
    const spy = sinon.spy();
    const wrapper = mount(
      <VegaEmbed
        data={spec}
        embedMode="vega-lite"
        renderedCallback={spy}
      />
    );

    const element = wrapper.instance();

    expect(element.shouldComponentUpdate({ data: '324' })).to.equal(true);
  })

  it('embeds vega and handles updates', () => {
    const spy = sinon.spy();
    const wrapper = mount(
      <VegaEmbed
        data={spec}
        embedMode="vega-lite"
        renderedCallback={spy}
      />
    );
    wrapper.render();
    // expect(spy).to.have.been.called;

    const spy2 = sinon.spy();

    wrapper.setProps({
      data: Immutable.fromJS({
        "data": {
          "values": cars,
        },
        "mark": "circle",
        "encoding": {
          "x": {"field": "Horsepower", "type": "quantitative"},
          "y": {"field": "Miles_per_Gallon", "type": "quantitative"}
        }
      }),
      renderedCallback: spy2,
    })
    // expect(spy2).to.have.been.called;

  })
})
