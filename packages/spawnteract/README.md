# Spawnteract

[![Greenkeeper badge](https://badges.greenkeeper.io/nteract/spawnteract.svg)](https://greenkeeper.io/)

Spawn yourself a Jupyter kernel backend.

```
npm install --save spawnteract
```

## Usage

```javascript
const spawnteract = require('spawnteract')

spawnteract.launch('python3').then(kernel => {
  // Returns
  // kernel.spawn <-- The running process, from child_process.spawn(...)
  // kernel.connectionFile <-- Connection file path
  // kernel.config <-- Connection information from the file

  // Print the ip address and port for the shell channel
   console.log(kernel.config.ip + ':' + kernel.config.shell_port);
})
```

You'll need to close `kernel.spawn` yourself as well as delete `kernel.connectionFile` from disk when finished:

```js
function cleanup(kernel) {
  kernel.spawn.kill();
  fs.unlink(kernel.connectionFile);
}
```

You will probably end up wanting to use this with [enchannel-zmq-backend](https://github.com/nteract/enchannel-zmq-backend).
