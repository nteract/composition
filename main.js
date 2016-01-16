// Bootstrap main that lets us use ES6, JSX, etc.
// Through the rest of our app code.
// NOTE: This must remain ES5 code.
const path = require('path');

const appRoot = path.join(__dirname);
require('electron-compile').init(appRoot, './app');
