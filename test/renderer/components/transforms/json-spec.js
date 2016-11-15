import React from 'react';
import Immutable from 'immutable';

import { expect } from 'chai';

import { shallow } from 'enzyme';

import JsonDisplay from '../../../../src/notebook/components/transforms/json';
import JSONTree from 'react-json-tree';

const baseData = Immutable.fromJS({ name: 'Octocat' });

describe('JsonDisplay', () => {
  it('renders a <JSONTree /> component', () => {
    const component = shallow(
      <JsonDisplay data={baseData} theme='light' />
    );
    expect(component.find(JSONTree)).to.have.length(1);
  });

  it('should not expand json tree by default', () => {
    const component = shallow(
      <JsonDisplay data={baseData} theme='light' />
    );
    const instance = component.instance();
    expect(instance.shouldExpandNode()).to.be.false;
  });

  it('should expand json tree if expanded metadata is true', () => {
    const metadata = Immutable.fromJS({ expanded: true });
    const component = shallow(
      <JsonDisplay data={baseData} theme='light' metadata={metadata} />
    );
    const instance = component.instance();
    expect(instance.shouldExpandNode()).to.be.true;
  });

  it('shouldComponentUpdate returns false if theme doesn\'t change', () => {
    const component = shallow(
      <JsonDisplay data={baseData} theme='light' />
    );
    const instance = component.instance();
    expect(instance.shouldComponentUpdate({ theme: 'light', data: baseData })).to.be.false;
  });

  it('shouldComponentUpdate returns true if theme changes', () => {
    const component = shallow(
      <JsonDisplay data={baseData} theme='light'/>
    );
    const instance = component.instance();
    expect(instance.shouldComponentUpdate({ theme: 'dark' })).to.be.true;
  });
});
