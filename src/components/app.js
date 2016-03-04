import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Notebook from './notebook';

const mapStateToProps = (state) => ({
  error: state.getIn(['kernel', 'error'])
});

export class App extends React.Component {
  static displayName = 'App';

  static propTypes = {
    error: PropTypes.string
  };

  render() {
    const { error } = this.props;
    return (
      <div>
        {error && <pre>{error}</pre>}
        <Notebook />
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
