import * as kernels from '../src/kernels';
import { expect } from 'chai';

const endpoint = 'http://localhost:8888';
const crossDomain = true;

describe('createSettingsForList', () => {
  it('creates the AJAX settings for listing the kernels', () => {
    const request = kernels.createSettingsForList(endpoint, crossDomain);

    expect(request).to.deep.equal({
      url: 'http://localhost:8888/api/kernels',
      crossDomain: true,
      responseType: 'json',
    });
  });
});

describe('createSettingsForGet', () => {
  it('creates the AJAX settings for getting a kernel by ID', () => {
    const request = kernels.createSettingsForGet(endpoint, crossDomain, 'test-id');

    expect(request).to.deep.equal({
      url: 'http://localhost:8888/api/kernels/test-id',
      crossDomain: true,
      responseType: 'json',
    });
  });
});

describe('createSettingsForStart', () => {
  it('creates the AJAX settings for creating a kernel', () => {
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
