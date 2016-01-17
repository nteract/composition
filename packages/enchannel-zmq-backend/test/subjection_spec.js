import { expect } from 'chai';

import {
  deepFreeze,
} from '../src/subjection';

describe('deepFreeze', () => {
  it('should Object.freeze nested objects', () => {
    const obj = {
      a: 1,
      b: {
        bb: {
          c: 3,
        },
      },
    };

    deepFreeze(obj);

    expect((() => {obj.a = 2;})).to.throw('Cannot assign to read only property');
    expect((() => {obj.b.bb.c = 42;})).to.throw('Cannot assign to read only property');
    expect((() => {obj.d = 12;})).to.throw('Can\'t add property d, object is not extensible');
  });
});
