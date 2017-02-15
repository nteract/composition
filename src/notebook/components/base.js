// @flow
import React from 'react';
import path from 'path';
import url from 'url';

function Base(props: Object, context: { store: Object }): ?React.Element<any> {
  const state = context.store.getState();
  const metadata = state.metadata.toJS();
  const cwd = `${path.dirname(metadata.filename)}/`;
  return React.cloneElement(props.children, { cwd });
}

Base.contextTypes = {
  store: React.PropTypes.object,
};

export default Base;
