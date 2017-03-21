import React from 'react';

import { mount } from 'enzyme';
import { dummyStore } from '../../utils';
import Toolbar from '../../../src/notebook/views/toolbar';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

describe('Toolbar View', () => {
  const clearOutputs = sinon.spy();

  it('should be able to render a toolbar', () => {
    const toolbar = mount(
      <Toolbar/>,
    );
    expect(toolbar).to.not.be.null;
    expect(toolbar.find('div.cell-toolbar').length).to.be.greaterThan(0);
  });
  it('clearOutputs does not throw error', () => {
    const toolbar = mount(
      <Toolbar type={'code'} clearOutputs={clearOutputs} />,
    );
    toolbar.find('.clearOutput').simulate('click');
    expect(clearOutputs).to.have.been.called;
  });
  it('shows "convert to code cell" menu entry for markdown type', () => {
    const toolbar = mount(
      <Toolbar type={'markdown'} />,
    );
    expect(toolbar.text()).to.contain('Convert to Code Cell');
  });
  it('shows "convert to markdown cell" menu entry for code type', () => {
    const toolbar = mount(
      <Toolbar type={'code'} />,
    );
    expect(toolbar.text()).to.contain('Convert to Markdown Cell');
  });
  it('changes "Convert to ..." menu entry on type change', () => {
    const toolbar = mount(
      <Toolbar type={'code'} />,
    );
    expect(toolbar.text()).to.contain('Convert to Markdown Cell');
    toolbar.setProps({ type: 'markdown' });
    expect(toolbar.text()).to.contain('Convert to Code Cell');
  });
})
