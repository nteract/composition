// From https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md

var jsdom = require('jsdom').jsdom;
var sinon = require('sinon');
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

// React assumes console.debug can/should be used when the userAgent matches Chrome
// For tests, we want these debug statements suppressed
global.console.debug = () => {};

global.navigator = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) nteract/0.0.12 Chrome/50.0.2661.102 Electron/1.1.3 Safari/537.36',
  platform: 'MacIntel',
};

global.Range = function Range() {
}

const createContextualFragment = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.children[0]; // so hokey it's not even funny
};

Range.prototype.createContextualFragment = function createContextualFragment(html) {
  createContextualFragment(html);
}

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
    },
    createContextualFragment,
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
  'redraw': function(el) {},
})

mock('enchannel-zmq-backend', {
  'createControlSubject': function(config, identity) {
    return;
  },
  'createStdinSubject': function(config, identity) {
    return;
  },
  createIOPubSubject: function(config, identity) {
    return;
  },
  createShellSubject: function(config, identity) {
    return;
  },
})

mock('electron', {
  'shell': {
    'openExternal': function(url) { },
  },
  'remote': {
    'app': {
      getPath: function(key) {
        if(key === 'home') {
          return '/home/home/on/the/range';
        }
        throw Error('not mocked');
      }
    },
    'dialog': {
      'showSaveDialog': function(config) { },
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
        'webContents': {
          'printToPDF': function(options, callback) {callback(null, null) }
        }
      };
    }
  },
  'webFrame': {
    'setZoomLevel': function(zoom) { },
    'getZoomLevel': function() { return 1; },
  },
  'ipcRenderer': {
    'on': function(message, callback) {
      if (message === 'kernel_specs_reply') {
        const specs = {
          python3: {
            name: 'python3',
            spec: { argv: {}, display_name: 'Python 3', language: 'python' }
          },
        };
        callback(null, specs);
      }
    },
    'send': function(message, action) {}
  },
});

mock('github', function () {
  return {
    authenticate: function(config) { },
    gists: {
        edit: function(request, callback) { callback(null, { id: 123, html_url: 'foo' }) },
        create: function(request, callback) { callback(null, { id: 123, html_url: 'foo' }) },
    },
    users: {
      get: function(request, callback) { callback(null, { login: 'jdetle' }) }
    }
  };
});

mock('react-notification-system', function () {
  return {
    'addNotification': function(config) { },
    'render': function() {return null;},
  };
});

mock('kernelspecs', {
  'find': function(kernelName) {
    return Promise.resolve({ name: kernelName });
  }
})

mock('spawnteract', {
  'launchSpec': function(kernelSpec, config) {
    function writeConnectionFile(config) { return new Promise((resolve, reject) => {
        try {
         resolve({config, connectionFile: 'connectionFile'});
        }
        catch (err) {
          reject(err);
        }
      })
    }
    return writeConnectionFile('config').then((c) => {
      return {
        spawn: 'runningKernel',
        connectionFile: c.connectionFile,
        config: c.config,
        kernelSpec: kernelSpec.name,
      };
    });
  },
  'launch': function(kernelSpecName, config) {
    function writeConnectionFile(config) { return new Promise((resolve, reject) => {
        try {
         resolve({config, connectionFile: 'connectionFile'});
        }
        catch (err) {
          reject(err);
        }
      })
    }
    return writeConnectionFile('config').then((c) => {
      return {
        spawn: 'runningKernel',
        connectionFile: c.connectionFile,
        config: c.config,
        kernelSpecName,
      };
    });
  },
});

mock('fs', {
  unlinkSync: function(){},
  unlink: function(){},
  existsSync: function(){},
  writeFile: function(name, data, callback) { callback(null) }
});
