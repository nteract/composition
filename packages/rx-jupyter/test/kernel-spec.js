import * as kernels from '../src/kernels';
import { expect } from 'chai';

const endpoint = 'http://localhost:8888';
const crossDomain = true;

describe('createAllKernel', () => {
  it('creates a payload for a kernels request', () => {
    const request = kernels.createSettingsForList(endpoint, crossDomain);

    expect(request).to.deep.equal({
      url: 'http://localhost:8888/api/kernels',
      crossDomain: true,
      responseType: 'json',
    });
  });
});

describe('createKernel', () => {
  it('creates a payload for a single kernel request', () => {
    const request = kernels.createSettingsForGet(endpoint, crossDomain, 'test-id');

    expect(request).to.deep.equal({
      url: 'http://localhost:8888/api/kernels/test-id',
      crossDomain: true,
      responseType: 'json',
    });
  });
});

describe('createLaunchKernel', () => {
  it('creates a payload for a launch kernel request', () => {
    const request = kernels.createSettingsForStart(endpoint, crossDomain, 'python3', '~');

    expect(request).to.deep.equal({
      url: 'http://localhost:8888/api/kernels',
      crossDomain: true,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: {
        path: '~',
        kernel_name: 'python3',
      }
    });
  });
});
