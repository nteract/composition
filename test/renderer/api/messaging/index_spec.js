import { expect } from 'chai';
import { childOf } from '../../../../src/notebook/api/messaging';

const Rx = require('rxjs/Rx');

describe('childOf', () => {
  it('filters messages that have the same parent', () => {
    return Rx.Observable.from([
      {parent_header: {msg_id: '100'}},
      {parent_header: {msg_id: '100'}},
      {parent_header: {msg_id: '200'}},
      {parent_header: {msg_id: '300'}},
      {parent_header: {msg_id: '100'}},
    ])
    .childOf({header: {msg_id: '100'}})
    .count()
    .toPromise()
    .then(val => {
      expect(val).to.equal(3);
    });
  });
});

describe('ofMessageType', () => {
  it('filters messages of type requested', () => {
    const requested = Rx.Observable.from([
      {header: {msg_type: 'a'}},
      {header: {msg_type: 'd'}},
      {header: {msg_type: 'b'}},
      {header: {msg_type: 'a'}},
      {header: {msg_type: 'd'}},
    ])
    .ofMessageType(['a', 'd'])
    .do(val => {
      expect(val.header.msg_type === 'a' || val.header.msg_type === 'd')
    })
    .pluck('header', 'msg_type')
    .count()
    .toPromise()
    .then(val => {
      expect(val).to.equal(4);
    });
  });
});
