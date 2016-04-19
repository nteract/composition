import { expect } from 'chai';

import createStore from '../../../src/notebook/store';

describe('createStore', () => {
  it('sets up our store model', (done) => {
    const reducers = {
      EAT_FOOD: function eat(state, action) {
        const { amount } = action;
        return Object.assign({}, state, {
          food: state.food - amount,
        });
      },
    };

    const { store, dispatch } = createStore({ food: 5 }, reducers);

    store.first().subscribe(state => {
      expect(state).to.deep.equal({ food: 3 });
      done();
    });
    dispatch({ amount: 2, type: 'EAT_FOOD' });
  });
});
