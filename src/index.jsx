import React from 'react';
import ReactDOM from 'react-dom';

import createStore from './store';
import { reducers } from './reducers';
import { readJSON } from './actions';
import Provider from './components/Util/Provider';

import Notebook from './components/Notebook';

const { store, dispatch } = createStore({ notebook: null }, reducers);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    store.subscribe(state => this.setState(state));
  }
  componentDidMount() {
    dispatch(readJSON('./intro.ipynb'));
  }
  render() {
    return (
      <Provider rx={{ dispatch, store }}>
        <div>
          {
            this.state.err &&
            <pre>{this.state.err.toString()}</pre>
          }
          {
            this.state.notebook &&
            <Notebook
              notebook={this.state.notebook}
              channels={this.state.channels} />
          }
        </div>
      </Provider>
    );
  }
}

App.displayName = 'App';

ReactDOM.render(
  <App/>,
  document.querySelector('#app')
);
