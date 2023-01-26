"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// STORAGE
const processes = new Map();
let mousePosition = { x: 0, y: 0 };
let mainWindowRect = { x: 0, y: 0, width: 0, height: 0 };
// CLASSES
const defaultOptionsAppWindow = {
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
};
const defaultOptionsClickWindow = {
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
};
class WindowProcess {
    constructor() {
        this.window = null;
    }
    createWindow(htmlPath, options) {
        const window = new electron_1.BrowserWindow(options);
        window.on("closed", this.destroy);
        window.loadFile(htmlPath);
        processes.set(window.webContents.getProcessId(), this);
        this.window = window;
        return window;
    }
    destroy() {
        if (!this.window) {
            return;
        }
        processes.delete(this.window.webContents.getProcessId());
        this.window.destroy();
        this.window = null;
    }
}
class AppWindow extends WindowProcess {
    constructor(name, options) {
        super();
        const finalizedOptions = Object.assign({}, defaultOptionsAppWindow, options);
        finalizedOptions.webPreferences.preload = `${__dirname}/preload.js`;
        const window = this.createWindow(`./src/windows/${name}/index.html`, finalizedOptions);
        window.setAlwaysOnTop(true, "screen-saver", 100);
    }
}
class ClickWindow extends WindowProcess {
    constructor(options) {
        super();
        const finalizedOptions = Object.assign({}, defaultOptionsClickWindow, options);
        finalizedOptions.webPreferences.preload = `${__dirname}/preload.js`;
        const window = this.createWindow(`./src/clickwindow/index.html`, finalizedOptions);
        window.setAlwaysOnTop(true, "screen-saver", 99);
    }
}
// PRESET
let clickWindow = null;
// FUNCTIONS
function initiateListeners() {
    // logs a message to the console
    electron_1.ipcMain.on("log", (event, text) => {
        console.log(`${event.processId} -> ${text}`);
    });
    // closes the window
    electron_1.ipcMain.on("window/close", (event) => {
        const window = processes.get(event.processId);
        if (window) {
            window.destroy();
        }
    });
    // tells main process that the mouse moved
    electron_1.ipcMain.on("mouse/move", (event, position) => {
        mousePosition = position;
    });
    // tells main process that the mouse is pressed down
    electron_1.ipcMain.on("mouse/down", (event) => {
        var _a;
        console.log("click");
        if (!clickWindow) {
            return;
        }
        console.log(`Random X: ${Math.random() * mainWindowRect.width - mainWindowRect.x}`);
        clickWindow.destroy();
        clickWindow = new ClickWindow({
            x: Math.floor(Math.random() * mainWindowRect.width + mainWindowRect.x),
            y: Math.floor(Math.random() * mainWindowRect.height + mainWindowRect.y),
        });
        console.log((_a = clickWindow.window) === null || _a === void 0 ? void 0 : _a.getPosition());
    });
}
function init() {
    var _a, _b, _c;
    console.log("ready");
    initiateListeners();
    // create a main window on every monitor
    let smallestX = 0;
    let smallestY = 0;
    let highestX = 0;
    let highestY = 0;
    const displays = electron_1.screen.getAllDisplays();
    for (let i = 0; i < displays.length; i++) {
        const display = displays[i];
        const bounds = display.bounds;
        const boundsX = bounds.x;
        const boundsY = bounds.y;
        const width = bounds.width;
        const height = bounds.height;
        if (boundsX < smallestX) {
            smallestX = boundsX;
        }
        if (boundsX + width > highestX) {
            highestX = boundsX + width;
        }
        if (boundsY < smallestX) {
            smallestX = boundsY;
        }
        if (boundsY + height > highestY) {
            highestY = boundsY + height;
        }
    }
    const mainWindow = new AppWindow("main", {
        x: smallestX,
        y: smallestY,
        minWidth: highestX - smallestX,
        minHeight: highestY - smallestY,
        width: highestX - smallestX,
        height: highestY - smallestY,
    });
    (_a = mainWindow.window) === null || _a === void 0 ? void 0 : _a.setIgnoreMouseEvents(true, { forward: true });
    mainWindowRect = (_b = mainWindow.window) === null || _b === void 0 ? void 0 : _b.getBounds();
    console.log(mainWindowRect);
    clickWindow = new ClickWindow({
        x: Math.floor(Math.random() * mainWindowRect.width + mainWindowRect.x),
        y: Math.floor(Math.random() * mainWindowRect.height + mainWindowRect.y),
    });
    console.log((_c = clickWindow.window) === null || _c === void 0 ? void 0 : _c.getPosition());
}
electron_1.app.on("ready", init);
electron_1.app.whenReady().then(() => {
    // Register a 'CommandOrControl+X' shortcut listener.
    const ret = electron_1.globalShortcut.register('CommandOrControl+X', () => {
        console.log('Quitting');
        electron_1.app.quit();
    });
    if (!ret) {
        console.log('registration failed');
    }
});
electron_1.app.on('will-quit', () => {
    // Unregister a shortcut.
    electron_1.globalShortcut.unregister('CommandOrControl+X');
    // Unregister all shortcuts.
    electron_1.globalShortcut.unregisterAll();
});
