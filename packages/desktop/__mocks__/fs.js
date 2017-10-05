module.exports = {
  unlinkSync: jest.fn(),
  unlink: jest.fn(),
  existsSync: jest.fn(),
  writeFile: (name, data, callback) => callback(null)
};
