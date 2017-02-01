import React from 'react';
import Immutable from 'immutable';

import { mount } from 'enzyme';
import chai, { expect } from 'chai';

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import ModelDebug from '../../../../src/notebook/components/transforms/model-debug';

describe('ModelDebug', () => {
  it('renders all models when no modelID set', () => {
    const modelDebugWrapper = mount(
      <ModelDebug
        data={'hey'}
        models={Immutable.fromJS({ 1: { fun: true } })}
      />,
    );

    const instance = modelDebugWrapper.instance();
    expect(instance.shouldComponentUpdate()).to.be.true;

    expect(
      modelDebugWrapper.contains(
        <pre>{JSON.stringify({ 1: { fun: true } }, null, 2)}</pre>,
      ),
    ).to.equal(true);
  });
});
