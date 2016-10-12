import * as kernel from '../lib/kernel';
import { expect } from 'chai';

describe('createAllKernelSpec', () => {
  it('creates a payload for a kernelspec request', () => {
    const request = kernel.createAllKernelSpec();

    expect(request).to.deep.equal({
      url: 'http://localhost:8888/api/kernelspecs',
      crossDomain: true,
      responseType: 'json',
    });
  });
});

describe('createAllKernel', () => {
  it('creates a payload for a kernels request', () => {
    const request = kernel.createAllKernel();

    expect(request).to.deep.equal({
      url: 'http://localhost:8888/api/kernels',
      crossDomain: true,
      responseType: 'json',
    });
  });
});

describe('createKernel', () => {
  it('creates a payload for a single kernel request', () => {
    const request = kernel.createKernel('test-id');

    expect(request).to.deep.equal({
      url: 'http://localhost:8888/api/kernels/test-id',
      crossDomain: true,
      responseType: 'json',
    });
  });
});

describe('createLaunchKernel', () => {
  it('creates a payload for a launch kernel request', () => {
    const request = kernel.createLaunchKernel('python3', '~');

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
