import React from 'react';

const Ansi = require('ansi-to-react');

export default function TextDisplay(props) {
  return (
    <Ansi>{props.data}</Ansi>
  );
}

TextDisplay.propTypes = {
  data: React.PropTypes.string,
};
