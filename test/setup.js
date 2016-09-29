// From https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md

var jsdom = require('jsdom').jsdom;

var exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('<html><body><div id="app"></div></html>');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

// For some reason, this property does not get set above.
global.Image = global.window.Image;

global.console.debug = () => console.warn(...arguments);

global.navigator = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) nteract/0.0.12 Chrome/50.0.2661.102 Electron/1.1.3 Safari/537.36',
  platform: 'MacIntel',
};

// HACK: Polyfil that allows codemirror to render in a JSDOM env.
global.window.document.createRange = function createRange() {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {
      return { right: 0 };
    },
    getClientRects: () => {
      return []
    }
  }
};

// Mocks for tests
var mock = require('mock-require');
mock('electron-json-storage', {
  'get': function(key, callback){
    callback(null, { theme: 'light' });
  },
  'set': function(key, json, callback) {
    if (!json && !key) {
      callback(new Error('Must provide JSON and key'));
    }

    callback(null);
  },
})

mock('plotly.js/dist/plotly', {
  'newPlot': function(data, layout, config) {},
})

mock('electron', {
  'shell': {
    'openExternal': function(url) { },
  },
  'remote': {
    'require': function(module) {
      if (module === 'electron') {
        return {
          'dialog': {
            'showSaveDialog': function(config) { },
          }
        };
      }
    },
    'BrowserWindow': {
      'getFocusedWindow': function() {
        return {
          'setTitle': function() {},
        };
      }
    },
    'getCurrentWindow': function() {
      return {
        'setTitle': function(){},
        'setDocumentEdited': function(){},
        'setRepresentedFilename': function() {},
      };
    }
  },
  'webFrame': {
    'setZoomLevel': function(zoom) { },
    'getZoomLevel': function() { return 1; },
  },
  'ipcRenderer': {
    'on': function() {},
  },
});

mock('home-dir', function () {
  return '/Users/jean-tester';
});

mock('github', function () {
  return {
    'authenticate': function(config) { },
    'gists': {
        'edit': function(request, callback) { },
        'create': function(request, callback) { },
    },
  };
});

mock('react-notification-system', function () {
  return {
    'addNotification': function(config) { },
    'render': function() {return null;},
  };
});

mock('spawnteract', {
  'launch': function(kernelSpec, config) { return new Promise() },
});
