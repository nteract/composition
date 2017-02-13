import React from 'react';

import { expect } from 'chai';
import { shallow } from 'enzyme';
import Immutable from 'immutable';

import Output from '../../../../../src/notebook/components/cell/display-area/output';
import RichestMime from '../../../../../src/notebook/components/cell/display-area/richest-mime';

const Ansi = require('ansi-to-react');

describe('Output', () => {
  it('handles display data', () => {
    const output = Immutable.fromJS({
      output_type: 'display_data',
      data:
      { 'text/html': '<h1>Multiple</h1>',
        'text/plain': '<IPython.core.display.HTML object>' },
      metadata: {},
    });

    const component = shallow(<Output output={output} />);
    expect(component.type()).to.equal(RichestMime);
    expect(component.first().props().bundle).to.eq(output.get('data'));
  });
  it('handles execute_component', () => {
    const output = Immutable.fromJS({
      data: {
        'text/html': [
          '<img src="https://avatars2.githubusercontent.com/u/12401040?v=3&s=200"/>',
        ],
        'text/plain': [
          '<IPython.core.display.Image object>',
        ],
      },
      execution_count: 7,
      metadata: {},
      output_type: 'execute_result',
    });

    const component = shallow(<Output output={output} />);
    expect(component.type()).to.equal(RichestMime);
    expect(component.first().props().bundle).to.eq(output.get('data'));
  });
  it('handles stream data', () => {
    const output = Immutable.fromJS({
      output_type: 'stream',
      name: 'stdout',
      text: 'hey',
    });

    const component = shallow(<Output output={output} />);
    expect(component.type()).to.equal(Ansi);
  });
  it('handles errors/tracebacks', () => {
    const output = Immutable.fromJS({
      output_type: 'error',
      traceback: ['whoa there buckaroo!'],
      ename: 'BuckarooException',
      evalue: 'whoa!',
    });

    const component = shallow(<Output output={output} />);
    expect(component.type()).to.equal(Ansi);

    const outputNoTraceback = Immutable.fromJS({
      output_type: 'error',
      ename: 'BuckarooException',
      evalue: 'whoa!',
    });

    const component2 = shallow(<Output output={outputNoTraceback} />);
    expect(component2.type()).to.equal(Ansi);
  });
});
