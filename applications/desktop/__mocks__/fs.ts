interface Fs {
  unlinkSync: jest.Mock;
  unlink: jest.Mock;
  existsSync: jest.Mock;
  writeFile: jest.Mock;
}

const fs: Fs = jest.genMockFromModule("fs");

fs.unlinkSync = jest.fn();
fs.unlink = jest.fn();
fs.existsSync = jest.fn();
fs.writeFile = jest.fn((name, data, callback) => callback(null));

module.exports = fs;
