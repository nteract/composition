import React from 'react';

import ReactMarkdown from 'react-markdown';

export default function MarkdownDisplay(props) {
  return (
    <ReactMarkdown source={props.data} />
  );
}

MarkdownDisplay.propTypes = {
  data: React.PropTypes.string.isRequired,
};
