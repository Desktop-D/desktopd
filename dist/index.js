"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const defaultOptionsAppWindow = {
    width: 400,
    height: 400,
    autoHideMenuBar: true,
    alwaysOnTop: true,
};
const defaultOptionsClickWindow = {
    width: 100,
    height: 100,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    //skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
};
class AppWindow {
    constructor(name, options) {
        const finalizedOptions = Object.assign({}, defaultOptionsAppWindow, options);
        const window = new electron_1.BrowserWindow(finalizedOptions);
        window.on("closed", () => {
            this.window = null;
        });
        window.loadFile(`./src/windows/${name}/index.html`);
        this.window = window;
    }
}
class ClickWindow {
    constructor(options) {
        const finalizedOptions = Object.assign({}, defaultOptionsClickWindow, options);
        const window = new electron_1.BrowserWindow(finalizedOptions);
        window.on("closed", () => {
            this.window = null;
        });
        window.loadFile(`./src/clickwindow/index.html`);
        this.window = window;
    }
}
electron_1.ipcMain.on("ping", () => {
    console.log("pong");
});
function init() {
    console.log("ready");
    // creates a "main" window
    function createMainWindow(rectangle) {
        var _a, _b;
        const mainWindow = new AppWindow("main", {
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height,
            transparent: true,
            frame: false,
            //skipTaskbar: true,
            movable: false,
            resizable: false,
            maximizable: false,
            minimizable: false,
            alwaysOnTop: true,
        });
        (_a = mainWindow.window) === null || _a === void 0 ? void 0 : _a.setIgnoreMouseEvents(true, { forward: true });
        (_b = mainWindow.window) === null || _b === void 0 ? void 0 : _b.webContents.openDevTools();
        return mainWindow;
    }
    // create a main window on every monitor
    const displays = electron_1.screen.getAllDisplays();
    for (let i = 0; i < displays.length; i++) {
        const display = displays[i];
        const window = createMainWindow(display.bounds);
    }
    const clickWindow = new ClickWindow({});
}
electron_1.app.on("ready", init);
