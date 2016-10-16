import * as kernelspecs from '../src/kernelspecs';
import { expect } from 'chai';

const endpoint = 'http://localhost:8888';
const crossDomain = true;

describe('createAllKernelSpec', () => {
  it('creates a payload for a kernelspec request', () => {
    const request = kernelspecs.createSettingsForList(endpoint, crossDomain);

    expect(request).to.deep.equal({
      url: 'http://localhost:8888/api/kernelspecs',
      crossDomain: true,
      responseType: 'json',
    });
  });
});
