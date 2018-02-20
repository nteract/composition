let idx = 1;

function uuid() {
  return idx++;
}

const mocked = jest.fn(uuid);

// self referential, wee
mocked.v4 = mocked;

module.exports = mocked;
