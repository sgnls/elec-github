'use strict';

const open = require('open');
const {
  app,
  nativeImage,
  ipcMain,
  Tray,
  Menu
} = require('electron');

let shouldQuit = false;

class Menus {

  constructor(iconPath) {
    this.iconPath = iconPath;
  }

  static quit() {
    shouldQuit = true;
    app.quit();
  }

  static reload(window) {
    window.show();
    window.reload();
  }

  register(window) {
    const appMenu = new Menu.buildFromTemplate(
      [
				{
					label: 'Reset',
					click: () => open('https://github.com')
				},
        {
          label: 'Refresh',
          accelerator: 'ctrl+R',
          click: () => Menus.reload(window)
        },
        {
          label: 'Quit',
          accelerator: 'ctrl+Q',
          click: () => Menus.quit()
        }
      ]
    );

    window.setMenu(new Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: appMenu
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Reset',
            click: () => open('https://github.com')
          },
          {
            label: 'Online Documentation',
            click: () => open('https://gh.sgnls.net')
          },
          {
            label: 'Github Project',
            click: () => open('https://github.com/sgnls/elec-github')
          },
          { type: 'separator' },
          {
            label: 'Version ' + app.getVersion(),
            enabled: false
          }
        ]
      }
    ]));

    this.tray = new Tray(this.iconPath);
    this.tray.setToolTip('Twitter');
    this.tray.on('click', () => {
      if (window.isFocused()) {
        window.hide();
      } else {
        window.show();
        window.focus();
      }
    });
    this.tray.setContextMenu(appMenu);

    window.on('close', (event) => {
      if (!shouldQuit) {
        event.preventDefault();
        window.hide();
      } else {
        app.quit();
      }
    });

    ipcMain.on('notifications', (event, { count, icon }) => {
      try {
        this.image = nativeImage.createFromDataURL(icon);
        this.tray.setImage(this.image);
        window.flashFrame(count > 0);
      } catch (err) {
        console.error(`Could not update tray icon: ${err.message}`, err)
      }
    });
  }
}

exports = module.exports = Menus;
