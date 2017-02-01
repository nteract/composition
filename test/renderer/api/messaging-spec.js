import { expect } from 'chai';

const Rx = require('rxjs/Rx');

describe('childOf', () => {
  it('filters messages that have the same parent', () => Rx.Observable.from([
      { parent_header: { msg_id: '100' } },
      { parent_header: { msg_id: '100' } },
      { parent_header: { msg_id: '200' } },
      { parent_header: { msg_id: '300' } },
      { parent_header: { msg_id: '100' } },
  ])
    .childOf({ header: { msg_id: '100' } })
    .count()
    .toPromise()
    .then(val => {
      expect(val).to.equal(3);
    }));
  it('throws an error if msg_id is not present', (done) => Rx.Observable.from([
      { parent_header: { msg_id_bad: '100' } },
      { parent_header: { msg_id_test: '100' } },
      { parent_header: { msg_id_invalid: '200' } },
      { parent_header: { msg_id_invalid: '300' } },
  ])
    .childOf({ header: { msg_id: '100' } })
    .subscribe(() => {
      throw new Error('Subscription was unexpectedly fulfilled.');
    }, (error) => {
      expect(error).to.not.be.null;
      done();
    }));
});

describe('ofMessageType', () => {
  it('filters messages of type requested', () => {
    Rx.Observable.from([
      { header: { msg_type: 'a' } },
      { header: { msg_type: 'd' } },
      { header: { msg_type: 'b' } },
      { header: { msg_type: 'a' } },
      { header: { msg_type: 'd' } },
    ])
    .ofMessageType(['a', 'd'])
    .do(val => {
      expect(val.header.msg_type === 'a' || val.header.msg_type === 'd');
    })
    .pluck('header', 'msg_type')
    .count()
    .toPromise()
    .then(val => {
      expect(val).to.equal(4);
    });
  });
  it('throws an error in msg_type is not present', (done) => Rx.Observable.from([
      { header: { msg_type_invalid: 'a' } },
      { header: { msg_type_invalid: 'd' } },
      { header: {} },
      { header: { msg_type: 'a' } },
  ])
    .ofMessageType(['a', 'd'])
    .subscribe(() => {
      throw new Error('Subscription was unexpectedly fulfilled.');
    }, (error) => {
      expect(error).to.not.be.null;
      done();
    }));
});
