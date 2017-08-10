const expect = require('chai').expect;
const sinon = require('sinon');
const enchannel = require('../');

describe('isChildMessage', function() {
  it('knows child', function() {
    const parent = { header: { msg_id: 'a'} };
    const child = { parent_header: { msg_id: 'a'} };
    expect(enchannel.isChildMessage(parent, child)).to.be.true;
  });

  it('knows non-child', function() {
    const parent = { header: { msg_id: 'a'} };
    const child = { parent_header: { msg_id: 'b'} };
    expect(enchannel.isChildMessage(parent, child)).to.be.false;
  });

  it('handle malformed parent', function() {
    const parent = 'oops';
    const child = { parent_header: { msg_id: 'b'} };
    expect(enchannel.isChildMessage(parent, child)).to.be.false;
  });

  it('handle malformed child', function() {
    const parent = { header: { msg_id: 'a'} };
    const child = 'oops';
    expect(enchannel.isChildMessage(parent, child)).to.be.false;
  });
});

describe('createMessage', function() {
  it('makes a msg', function() {
    const msg = enchannel.createMessage('a', 'b', 'c');
    expect(msg).to.be.an('object');
    expect(msg.header).to.be.an('object');
    expect(msg.header.username).to.equal('a');
    expect(msg.header.session).to.equal('b');
    expect(msg.header.msg_type).to.equal('c');
  });
});

function spoofChannels() {
  const shell = {
    next: sinon.spy(),
    complete: sinon.spy(),
    filter: () => shell,
    map: () => shell,
    subscribe: cb => cb.call(shell),
  };
  return channels = {
    shell,
    iopub: { complete: sinon.spy() },
    stdin: { complete: sinon.spy() },
    control: { complete: sinon.spy() },
    heartbeat: { complete: sinon.spy() },
  };
}

describe('shutdownRequest', function() {
  it('shutdowns channels', function() {
    const channels = spoofChannels();
    enchannel.shutdownRequest(channels, 'a', 'b');
    expect(channels.shell.complete.called).to.be.true;
    expect(channels.iopub.complete.called).to.be.true;
    expect(channels.stdin.complete.called).to.be.true;
    expect(channels.control.complete.called).to.be.true;
    expect(channels.heartbeat.complete.called).to.be.true;
  });
  it('handles missing heartbeat', function() {
    const channels = spoofChannels();
    channels.heartbeat = undefined;
    enchannel.shutdownRequest(channels, 'a', 'b');
    expect(channels.shell.complete.called).to.be.true;
    expect(channels.iopub.complete.called).to.be.true;
    expect(channels.stdin.complete.called).to.be.true;
    expect(channels.control.complete.called).to.be.true;
  });
});
