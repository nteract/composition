# kernelspecs

[![Greenkeeper badge](https://badges.greenkeeper.io/nteract/kernelspecs.svg)](https://greenkeeper.io/)

Find Jupyter kernelspecs on a system

```
npm install kernelspecs
```

## Usage

```javascript
> require('kernelspecs').findAll().then(console.log)
Promise { <pending> }
> { babel:
   { files:
      [ '/Users/rgbkrk/Library/Jupyter/kernels/babel/kernel.json',
        '/Users/rgbkrk/Library/Jupyter/kernels/babel/logo-32x32.png',
        '/Users/rgbkrk/Library/Jupyter/kernels/babel/logo-64x64.png' ],
     resources_dir: '/Users/rgbkrk/Library/Jupyter/kernels/babel',
     spec:
      { argv: [Object],
        display_name: 'Babel (Node.js)',
        language: 'babel' } },
  python3:
   { files:
      [ '/usr/local/share/jupyter/kernels/python3/kernel.json',
        '/usr/local/share/jupyter/kernels/python3/logo-32x32.png',
        '/usr/local/share/jupyter/kernels/python3/logo-64x64.png' ],
     resources_dir: '/usr/local/share/jupyter/kernels/python3',
     spec: { language: 'python', display_name: 'Python 3', argv: [Object] } },
  javascript:
   { files:
      [ '/Users/rgbkrk/Library/Jupyter/kernels/javascript/kernel.json',
        '/Users/rgbkrk/Library/Jupyter/kernels/javascript/logo-32x32.png',
        '/Users/rgbkrk/Library/Jupyter/kernels/javascript/logo-64x64.png' ],
     resources_dir: '/Users/rgbkrk/Library/Jupyter/kernels/javascript',
     spec:
      { argv: [Object],
        display_name: 'Javascript (Node.js)',
        language: 'javascript' } } }
```
