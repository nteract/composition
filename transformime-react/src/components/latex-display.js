import React from 'react';
import katex from 'katex';

export default function LaTeXDisplay(props) {
  return (
    <div
      dangerouslySetInnerHTML={{ // eslint-disable-line
        __html: katex.renderToString(props.data),
      }}
    />
  );
}

LaTeXDisplay.propTypes = {
  data: React.PropTypes.string,
};
