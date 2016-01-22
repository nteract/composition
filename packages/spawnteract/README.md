# Spawnteract

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
  // kernel.connFile <-- Connection file path
  // kernel.config <-- Connection information from the file
})
```

You'll need to close `kernel.spawn` yourself as well as delete `kernel.connFile` from disk when finished.

You will probably end up wanting to use this with [enchannel-zmq-backend](https://github.com/nteract/enchannel-zmq-backend).
