import React from 'react';
import Immutable from 'immutable';

import { mount } from 'enzyme';
import chai, { expect } from 'chai';

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

const plotly = require('plotly.js/dist/plotly');

import PlotlyTransform from '../../../../src/notebook/components/transforms/plotly';

const immutableFigure = Immutable.fromJS({
  data: [
    {'x': [1999, 2000, 2001, 2002], 'y': [10, 15, 13, 17], 'type': 'scatter'},
    {'x': [1999, 2000, 2001, 2002], 'y': [16, 5, 11, 9], 'type': 'scatter'},
  ],
  layout: {
    'title': 'Super Stuff',
    'xaxis': { 'title': 'Year', 'showgrid': false, 'zeroline': false },
    'yaxis': { 'title': 'Percent', 'showline': false },
    'height': '100px',
  },
});

describe('PlotlyTransform', () => {
  it('plots some data from an Immutablejs structure', () => {
    const newPlot = sinon.spy(plotly, 'newPlot');

    const plotComponent = mount(
      <PlotlyTransform
        data={immutableFigure}
      />
    );

    const instance = plotComponent.instance();

    expect(instance.shouldComponentUpdate({ data: '' })).to.be.true;
    expect(newPlot).to.have.been
      .calledWith(
        instance.el,
        [
          {'x': [1999, 2000, 2001, 2002], 'y': [10, 15, 13, 17], 'type': 'scatter'},
          {'x': [1999, 2000, 2001, 2002], 'y': [16, 5, 11, 9], 'type': 'scatter'},
        ],
        {
          'title': 'Super Stuff',
          'xaxis': { 'title': 'Year', 'showgrid': false, 'zeroline': false },
          'yaxis': { 'title': 'Percent', 'showline': false },
          'height': '100px',
        })

        // Unwrap spy
        plotly.newPlot.restore();
  });

  it('plots some data from a JSON string', () => {
    const newPlot = sinon.spy(plotly, 'newPlot');

    const plotComponent = mount(
      <PlotlyTransform
        data={JSON.stringify(immutableFigure.toJS())}
      />
    );

    const instance = plotComponent.instance();

    expect(instance.shouldComponentUpdate({ data: '' })).to.be.true;
    expect(newPlot).to.have.been
      .calledWith(
        instance.el,
        [
          {'x': [1999, 2000, 2001, 2002], 'y': [10, 15, 13, 17], 'type': 'scatter'},
          {'x': [1999, 2000, 2001, 2002], 'y': [16, 5, 11, 9], 'type': 'scatter'},
        ],
        {
          'title': 'Super Stuff',
          'xaxis': { 'title': 'Year', 'showgrid': false, 'zeroline': false },
          'yaxis': { 'title': 'Percent', 'showline': false },
          'height': '100px',
        })
    // Unwrap spy
    plotly.newPlot.restore();
  });

  it('processes updates', () => {
    const newPlot = sinon.spy(plotly, 'newPlot');
    const redraw = sinon.spy(plotly, 'redraw');

    const wrapper = mount(
      <PlotlyTransform
        data={immutableFigure}
      />
    );

    const instance = wrapper.instance();

    wrapper.setProps({
      data: immutableFigure.setIn(['data', 0, 'type'], 'bar'),
    });

    expect(instance.el.data[0].type).to.equal('bar');

    expect(redraw).to.have.been.calledWith(instance.el)

      // Unwrap spy
      plotly.newPlot.restore();
      plotly.redraw.restore();
  })
});
