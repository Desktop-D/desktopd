import { BrowserWindow } from "electron";

export const defaultOptionsAppWindow: Electron.BrowserWindowConstructorOptions = {
    width: 400,
    height: 400,
    autoHideMenuBar: true,
    alwaysOnTop: true,

    transparent: true,
    frame: false,

    skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    acceptFirstMouse: true,
    fullscreenable: false,
    focusable: false,

    webPreferences: {
        nodeIntegration: true,
    }
}

export const defaultOptionsClickWindow: Electron.BrowserWindowConstructorOptions = {
    width: 100,
    height: 100,
    autoHideMenuBar: true,
    alwaysOnTop: true,

    transparent: true,
    frame: false,
    skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    acceptFirstMouse: true,
    fullscreenable: false,

    webPreferences: {
        nodeIntegration: true,
    }
}