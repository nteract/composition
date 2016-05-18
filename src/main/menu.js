import { dialog, app, shell, Menu } from 'electron';

const kernelspecs = require('kernelspecs');

import { launchFilename, launchNewNotebook } from './launch';

import * as path from 'path';

function send(focusedWindow, eventName, obj) {
  if (!focusedWindow) {
    console.error('renderer window not in focus (are your devtools open?)');
    return;
  }
  focusedWindow.webContents.send(eventName, obj);
}

function createSender(eventName, obj) {
  return (item, focusedWindow) => {
    send(focusedWindow, eventName, obj);
  };
}

export const fileSubMenus = {
  new: {
    label: '&New',
    accelerator: 'CmdOrCtrl+N',
  },
  open: {
    label: '&Open',
    click: () => {
      const opts = {
        title: 'Open a notebook',
        filters: [
          { name: 'Notebooks', extensions: ['ipynb'] },
        ],
        properties: [
          'openFile',
        ],
        // TODO: This should be based on the currently opened notebook
        defaultPath: process.cwd(),
      };
      dialog.showOpenDialog(opts, (fname) => {
        if (fname) {
          launchFilename(fname[0]);
        }
      });
    },
    accelerator: 'CmdOrCtrl+O',
  },
  save: {
    label: '&Save',
    click: createSender('menu:save'),
    accelerator: 'CmdOrCtrl+S',
  },
  saveAs: {
    label: 'Save &As',
    click: (item, focusedWindow) => {
      const opts = {
        title: 'Save Notebook As',
        filters: [{ name: 'Notebooks', extensions: ['ipynb'] }],
      };
      dialog.showSaveDialog(opts, (filename) => {
        if (!filename) {
          return;
        }

        const ext = path.extname(filename) === '' ? '.ipynb' : '';
        send(focusedWindow, 'menu:save-as', `${filename}${ext}`);
      });
    },
    accelerator: 'CmdOrCtrl+Shift+S',
  },
};

export const file = {
  label: '&File',
  submenu: [
    fileSubMenus.new,
    fileSubMenus.open,
    fileSubMenus.save,
    fileSubMenus.saveAs,
  ],
};

export const edit = {
  label: 'Edit',
  submenu: [
    {
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo',
    },
    {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo',
    },
    {
      type: 'separator',
    },
    {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut',
    },
    {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy',
    },
    {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste',
    },
    {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall',
    },
  ],
};

export const cell = {
  label: 'Cell',
  submenu: [
    {
      label: 'Run All',
      click: createSender('menu:run-all'),
    },
    {
      label: 'Clear All',
      click: createSender('menu:clear-all'),
    },
  ],
};
const theme_menu = [
  {
    label: 'Light',
    click: createSender('menu:theme', 'light'),
  },
  {
    label: 'Dark',
    click: createSender('menu:theme', 'dark'),
  },
  {
    label: 'Classic',
    click: createSender('menu:theme', 'classic'),
  },
];

const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1;
if (month === 12) {
  theme_menu.push(
    {
      label: 'Hohoho',
      click: createSender('menu:theme', 'christmas'),
    });
} else if (month === 10 && day === 31) {
  theme_menu.push({
    label: 'Mwaaahahahhah',
    click: createSender('menu:theme', 'halloween'),
  });
}


export const view = {
  label: 'View',
  submenu: [
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          focusedWindow.reload();
        }
      },
    },
    {
      label: 'Toggle Full Screen',
      accelerator: (() => {
        if (process.platform === 'darwin') {
          return 'Ctrl+Command+F';
        }
        return 'F11';
      })(),
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: (() => {
        if (process.platform === 'darwin') {
          return 'Alt+Command+I';
        }
        return 'Ctrl+Shift+I';
      })(),
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
    },
    {
      label: 'Zoom In',
      accelerator: 'CmdOrCtrl+=',
      click: createSender('menu:zoom-in'),
    },
    {
      label: 'Zoom Out',
      accelerator: 'CmdOrCtrl+-',
      click: createSender('menu:zoom-out'),
    },
    {
      label: 'Theme',
      submenu: theme_menu,
    },
  ],
};


export const publish = {
  label: 'Publish',
  submenu: [
    {
      label: 'to Gist...',
      click: createSender('menu:publish:gist'),
    },
  ],
};

const windowDraft = {
  label: 'Window',
  role: 'window',
  submenu: [
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize',
    },
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close',
    },
  ],
};

if (process.platform === 'darwin') {
  windowDraft.submenu.push(
    {
      type: 'separator',
    },
    {
      label: 'Bring All to Front',
      role: 'front',
    }
  );
}

export const window = windowDraft;

export const help = {
  label: 'Help',
  role: 'help',
  submenu: [
    {
      label: 'Learn More',
      click: () => { shell.openExternal('http://github.com/nteract/nteract'); },
    },
  ],
};

const name = 'nteract';
app.setName(name);

export const named = {
  label: name,
  submenu: [
    {
      label: `About ${name}`,
      role: 'about',
    },
    {
      type: 'separator',
    },
    {
      label: 'Services',
      role: 'services',
      submenu: [],
    },
    {
      type: 'separator',
    },
    {
      label: `Hide ${name}`,
      accelerator: 'Command+H',
      role: 'hide',
    },
    {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers',
    },
    {
      label: 'Show All',
      role: 'unhide',
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => app.quit(),
    },
  ],
};

export function generateDefaultTemplate() {
  const template = [];

  if (process.platform === 'darwin') {
    template.push(named);
  }

  template.push(file);
  template.push(edit);
  template.push(view);
  template.push(publish);
  template.push(window);
  template.push(help);

  return template;
}

export const defaultMenu = Menu.buildFromTemplate(generateDefaultTemplate());

export function loadFullMenu() {
  return kernelspecs.findAll().then(kernelSpecs => {
    function generateSubMenu(kernelName) {
      return {
        label: kernelSpecs[kernelName].spec.display_name,
        click: createSender('menu:new-kernel', kernelName),
      };
    }

    const kernelMenuItems = Object.keys(kernelSpecs).map(generateSubMenu);

    const newNotebookItems = Object.keys(kernelSpecs).map(kernelName => {
      const kernelSpec = kernelSpecs[kernelName];
      return {
        label: kernelSpecs[kernelName].spec.display_name,
        click: () => launchNewNotebook(kernelSpec),
      };
    });

    const languageMenu = {
      label: '&Language',
      submenu: [
        {
          label: '&Kill Running Kernel',
          click: createSender('menu:kill-kernel'),
        },
        {
          label: 'Restart Running Kernel',
          click: createSender('menu:restart-kernel'),
        },
        {
          type: 'separator',
        },
        // All the available kernels
        ...kernelMenuItems,
      ],
    };
    const template = [];

    if (process.platform === 'darwin') {
      template.push(named);
    }

    const fileWithNew = {
      label: '&File',
      submenu: [
        {
          label: '&New',
          submenu: [
            ...newNotebookItems,
          ],
        },
        fileSubMenus.open,
        fileSubMenus.save,
        fileSubMenus.saveAs,
      ],
    };

    template.push(fileWithNew);
    template.push(edit);
    template.push(cell);
    template.push(view);

    // Application specific functionality should go before window and help
    template.push(languageMenu);
    template.push(publish);
    template.push(window);
    template.push(help);

    const menu = Menu.buildFromTemplate(template);
    return menu;
  });
}
